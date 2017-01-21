"use strict";

define(['app'], function (app) {
    app.factory('GlobalSrv', [
        '$rootScope', '$location', '$http', '$httpParamSerializer', '$q', '$compile', 'ADMdtpFactory', 'ADMdtpConvertor', 'notif', function ($rootScope, $location, $http, $httpParamSerializer, $q, $compile, ADMdtpFactory, ADMdtpConvertor, notif) {
            
            var baseCrud = function (type, route, params, silent) {
                var deferred = $q.defer();
                $http[type](route, params).success(function (data, status, a, full) {
                    //if (data instanceof Object && (angular.isDefined(data.resultFlag) && !data.resultFlag || data.commitCrudOperation && angular.isDefined(data.commitCrudOperation) && !data.commitCrudOperation.resultFlag))
                    //    $rootScope.errorNotif('INTERNAL', full.url, params, data);
                    deferred.resolve(data);
                }).error(function (err, status, a, full) {
                    switch (status) {
                        case 429:
                            notif.say({
                                type: "danger",
                                title: '',
                                message: [
                                    '<span>',
                                    '   به دلیل استفاده بیش از حد از این درخواست، تا مدتی دسترسی شما به این سرویس قطع می شود!',
                                    '   <br>',
                                    '   اگر به اشتباه این خطا به شما داده شده است لطفا ما را مطلع کنید:',
                                    '   <br>',
                                    '   <span class="relCenter center"><md-button md-theme="green" class="md-raised md-primary md-block radius" ng-click="throttleNotif(\'', full.url, '\')"><i class="material-icons" style="margin-left: 5px;">assignment</i> درخواست پیگیری</md-button></span>',
                                    '</span>'
                                ].join(''),
                                compile: true,
                                sticky: false,
                                time: 60
                            });
                            break;
                        case 403:
                            notif.say({
                                type: "danger",
                                icon: 'remove_circle',
                                title: '',
                                message: [
                                    '<span>',
                                    '   شما اجازه انجام این درخواست را ندارید!',
                                    '   <br>',
                                    '   اگر به اشتباه این خطا به شما داده شده است لطفا بخش فنی سایت را مطلع سازید:',
                                    '   <br>',
                                    '   <span class="relCenter center"><md-button md-theme="green" class="md-raised md-primary md-block radius" ng-href="/contactUs" style="margin-bottom: -6px;"><i class="material-icons" style="margin-left: 5px;">assignment</i> ارتباط با بخش فنی</md-button></span>',
                                    '</span>'
                                ].join(''),
                                compile: true,
                                sticky: false,
                                time: 60
                            });
                            break;
                        default:
                            if (!silent) {
                                $rootScope.errorNotif('SERVER', full.url, params, err);
                                notif.error('خطا در ارتباط با سرور!');
                            }
                    }

                    deferred.reject("Error");
                });
                return deferred.promise;
            };

            var fake = function(data, delay) {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve(data);
                }, delay || 0);
                return deferred.promise;
            };


            var uploadFile = function (route, id, idx, ids, callBack) {
                var files = angular.element('#' + id)[0].files;
                console.info(route, files, idx, ids);
                if (idx == files.length)
                    return callBack(ids);

                var fd = new FormData();
                fd.append("file", files[idx]);

                $http.post(route, fd, {
                    withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).success(function (data, status, a, full) {
                    ids.push(data.result[0]);
                    uploadFile(route, id, idx + 1, ids, callBack);
                });
            };

            return {
                user: {
                    auth: function () {
                        var deferred = $q.defer();
                        if ($rootScope.user) deferred.resolve({ is: true });
                        else {
                            $http.post($rootScope.baseUrl + '/user/info', null).success(function (res) {
                                $rootScope.$applyAsync(function () {
                                    if (res.err) {
                                        $rootScope.user = false;
                                        deferred.resolve({ is: false });
                                    } else {
                                        res.data.rol = res.data.rol.toLowerCase();
                                        $rootScope.user = res.data;
                                        deferred.resolve({ is: true });
                                    }

                                });
                            }).error(function (err) {
                                notif.error('خطا در ارتباط با سرور!');
                                deferred.reject('Error');
                            });
                        }
                        return deferred.promise;
                    },
                    handleAuth: function (force) {
                        if (!$rootScope.user && $rootScope.cachePath && (force || $rootScope.cachePath != '/')) {
                            $rootScope.handleAuth = true;
                            $http.post($rootScope.baseUrl + '/user/info', null).success(function (res) {
                                $rootScope.$applyAsync(function () {
                                    $rootScope.handleAuth = false;
                                    if (res.err) {
                                        notif.warn('ابتدا وارد حساب کاربری خود شوید!');
                                        $rootScope.user = false;
                                        $location.path('/login');
                                    } else {
                                        res.data.rol = res.data.rol.toLowerCase();
                                        $rootScope.user = res.data;
                                        var path = $rootScope.cachePath;
                                        $rootScope.cachePath = '/';
                                        $location.path(path);
                                    }

                                });
                            }).error(function (err) {
                                notif.error('خطا در ارتباط با سرور!');
                            });
                        } else {
                            $location.path('/login');
                        }
                    }
                },
                cruds: {
                    get: function (route, params, silent) {
                        if (params instanceof Object)
                            route += '?' + $httpParamSerializer(params);
                        return baseCrud('get', route, undefined, silent);
                    },
                    post: function (route, params, silent) {
                        return baseCrud('post', route, params, silent);
                    },
                    put: function (route, params, silent) {
                        return baseCrud('put', route, params, silent);
                    },
                    delete: function (route, params, silent) {
                        if (params instanceof Object)
                            route += '?' + $httpParamSerializer(params);
                        return baseCrud('delete', route, undefined, silent);
                    },
                    fake: fake,
                    uploadFile: function (route, files) {
                        var deferred = $q.defer();
                        uploadFile(route, files, 0, [], function(data) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    }
                },
                date: {
                    toJalali: function (date, noTime) {
                        if (typeof date == 'string') date = date.toDate();
                        var _date = ADMdtpFactory.convertToJalali(new Date(date));
                        return (_date.year + '/' + _date.month + '/' + _date.day + (noTime ? '' : (' ' + (new Date(date).getHours()) + ':' + (new Date(date).getMinutes()))));
                    },
                    toGregorian: function (year, month, day) {
                        if (typeof date == 'string') date = date.toDate();
                        var _date = ADMdtpConvertor.toGregorian(year, month, day);
                        return (_date.year + '/' + _date.month + '/' + _date.day);
                    },
                    dateDscr: function (date, more) {
                        if (typeof date == 'string')
                            date = date.toDate();
                        if (date instanceof Date)
                            date = new Date(date).getTime();
                        if (typeof date == 'number' && String(date).length == 10)
                            date *= 1000;

                        more = more || {};
                        var dif = (more.tomorrow ? new Date(new Date(date).short()).getTime() : date);
                        var now = new Date();
                        now = (more.tomorrow ? now.short() : now);
                        var extra = '';
                        if (more.diff) {
                            dif = (dif - new Date(now).getTime()) / 1000;
                            extra = ' دیگر';
                            if (dif < 0) {
                                dif *= -1;
                                extra = ' پیش';
                            }
                        }

                        //debugger;

                        dif = Math.max(0, dif);
                        var year = Math.floor(dif / (60 * 60 * 24 * 365));
                        dif = dif % (60 * 60 * 24 * 365);
                        var month = Math.floor(dif / (60 * 60 * 24 * 30));
                        dif = dif % (60 * 60 * 24 * 30);
                        var day = Math.floor(dif / (60 * 60 * 24));
                        dif = dif % (60 * 60 * 24);
                        var hour = Math.floor(dif / (60 * 60));
                        dif = dif % (60 * 60);
                        var minute = Math.floor(dif / (60));
                        dif = dif % (60);
                        var second = Math.floor(dif);


                        if (year)
                            return (year + ' سال' + (month && more.two ? (' و ' + month + ' ماه') : '') + extra);
                        if (month)
                            return (month + ' ماه' + (day && more.two ? (' و ' + day + ' روز') : '') + extra);
                        if (day) {
                            if (day == 1 && more.tomorrow && !hour)
                                return (extra.length == 4 ? 'دیروز' : 'فردا');
                            return (day + ' روز' + (hour && more.two ? (' و ' + hour + ' ساعت') : '') + extra);
                        }
                        if (more.tomorrow)
                            return 'امروز';
                        if (hour)
                            return (hour + ' ساعت' + (minute && more.two ? (' و ' + minute + ' دقیقه') : '') + extra);
                        if (minute)
                            return (minute + ' دقیقه');
                        return (more.ended ? 'به پایان رسید' : ('کمتر از 1 دقیقه' + extra));

                    },
                    progress: function (item) {
                        if (typeof item.start == 'string') item.start = item.start.replace(/-/g, '/');
                        if (typeof item.expire == 'string') item.expire = item.expire.replace(/-/g, '/');

                        var date = {
                            start: new Date(item.start).getTime(),
                            expire: new Date(item.expire).getTime(),
                            now: new Date().getTime()
                        }
                        var value = 100 * (date.expire - date.now) / (date.expire - date.start);
                        value = Math.floor(value);
                        value = Math.max(value, 0);
                        value = Math.min(value, 100);
                        var type;

                        if (value < 25)
                            type = 'danger';
                        else if (value < 50)
                            type = 'warning';
                        else if (value < 75)
                            type = 'info';
                        else
                            type = 'success';

                        return { progress: value, progressType: type };
                    }
                },
                price: {
                    newPrice: function (item, discount) {
                        var price = Number(item.price);
                        var offer_amount_typ = (discount ? discount[0] : item.offer_amount_typ);
                        var offer_amount = Number((discount ? discount[1] : item.offer_amount));
                        return ((offer_amount_typ == 'PRICE') ? (price - offer_amount) : (price * (100 - offer_amount) / 100));
                    }
                },
                validation: {
                    nationalCode: function (code) {
                        code = code || '';
                        if (code.length != 10) return false;
                        var sum = 0;
                        for (var i = 0; i < 9; i++)
                            sum += code[i] * (10 - i);
                        var remain = sum % 11;
                        if (remain < 2 && code[9] == remain || remain >= 2 && code[9] == 11 - remain)
                            return true;
                        return false;
                    }
                }
            };
        }
    ]);
});