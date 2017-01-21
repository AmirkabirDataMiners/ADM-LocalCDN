"use strict";

define(['app'], function (app) {

    var notifOnRun = function ($rootScope, $compile) {
        var notifDrv = angular.element('<notif-drv></notif-drv>');
        angular.element('body').prepend(notifDrv);

        $rootScope.$applyAsync(function () {
            $compile(notifDrv)($rootScope);
        });
    }

    var notif = function ($rootScope, $timeout, $filter, $q) {
        var directiveCallBack;

        var fire = function (message) {
            var _message = {
                id: Math.floor(Math.random() * 1000000),
                type: 'primary',
                title: '',
                message: '',
                sticky: false,
                time: 3000
            };

            angular.extend(_message, message);
            if (directiveCallBack) directiveCallBack(_message, 'notif');
        }

        var handleInput = function (msg, extra) {
            if (!msg) return [];
            if (typeof msg == 'string')
                msg = [msg];
            for (var i = 0, j = msg.length; i < j; i++)
                if (typeof msg[i] == 'string') msg[i] = angular.extend({ message: msg[i] }, extra || {});

            return msg;
        }

        var say = function (msg, extra) {
            handleInput(msg, extra).loop(function (item) {
                fire(item);
            });
        }
        var success = function (msg, extra) {
            handleInput(msg, extra).loop(function (item) {
                item.type = 'success';
                item.icon = 'check_circle';
                fire(item);
            });
        }
        var info = function (msg, extra) {
            handleInput(msg, extra).loop(function (item) {
                item.type = 'info';
                item.icon = 'info';
                fire(item);
            });
        }
        var warn = function (msg, extra) {
            handleInput(msg, extra).loop(function (item) {
                item.type = 'warning';
                item.icon = 'warning';
                fire(item);
            });
        }
        var error = function (msg, extra) {
            handleInput(msg, extra).loop(function (item) {
                item.type = 'danger';
                item.icon = 'cancel';
                fire(item);
            });
        }

        var confirm = function (question) {
            return directiveCallBack(question, 'confirm');
        }

        return {
            setCB: function (f) {
                directiveCallBack = f;
            },
            say: say,
            success: success,
            info: info,
            warn: warn,
            error: error,
            confirm: confirm
        }
    }

    var notifDrv = function ($rootScope, $timeout, $q, $sce, notif) {
        return {
            scope: {},
            controllerAs: 'vm',
            templateUrl: $sce.trustAsResourceUrl(CDNServer + 'notif.html'),
            controller: ['$scope', function ($scope) {
                var vm = this;
                vm.notifs = [];

                var getIdx = function (id) {
                    return _.findIndex(vm.notifs, { id: id });
                }

                $scope.startTimer = function (item, parent) {
                    if (!item.sticky) {
                        item.timeout = $timeout(function () {
                            var idx = getIdx(item.id);
                            if (idx != -1) vm.notifs.splice(idx, 1);
                        }, item.time);
                    }
                }

                $scope.toggleSticky = function (item) {
                    item.sticky = !item.sticky;

                    if (item.sticky)
                        $timeout.cancel(item.timeout);
                    else
                        $scope.startTimer(item);
                }

                $scope.dismiss = function (item) {
                    var idx = getIdx(item.id);
                    if (idx != -1) vm.notifs.splice(idx, 1);
                }

                $scope.dismissAll = function () {
                    vm.notifs = [];
                }

                notif.setCB(function (msg, type) {

                    if (type == 'notif')
                        $scope.$applyAsync(function() {
                            vm.notifs.push(angular.copy(msg));
                        });
                    else if (type == 'confirm') {
                        msg.deferred = $q.defer();

                        angular.extend(msg, {
                            show: true,
                            dismiss: function () {
                                vm.confirm.show = false;
                            },
                            confirm: function () {
                                vm.confirm.dismiss();
                                vm.confirm.deferred.resolve(true);
                            }
                        });
                        $scope.$applyAsync(function() {
                            vm.confirm = angular.copy(msg);
                        });

                        return msg.deferred.promise;
                    }
                });

            }]
        }
    }

    return angular.module("notifModule", [])
        .run(["$rootScope", "$compile", notifOnRun])
        .factory("notif", ["$rootScope", "$timeout", "$filter", "$q", notif])
        .directive("notifDrv", ["$rootScope", "$timeout", "$q", "$sce", "notif", notifDrv]);
});