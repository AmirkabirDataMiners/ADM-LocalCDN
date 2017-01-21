"use strict";

define(['app'], function(app) {
    app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });

    app.directive('ngEsc', function() {
        return function(scope, element, attrs) {
            element.bind('keydown keypress', function(event) {
                if (event.which === 27) { // 27 = esc key
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEsc);
                    });
                    event.preventDefault();
                }
            });
        };
    });

    app.directive('ngDragenter', function() {
        return function(scope, element, attrs) {
            element.bind('dragenter', function(e) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngDragenter);
                });
                e.stopPropagation();
                e.preventDefault();
            });
        }
    });

    app.directive('ngTab', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 9) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngTab);
                    });

                    event.preventDefault();
                }
            });
        };
    });

    app.directive('anim', [
        '$timeout', function($timeout) {
            return function(scope, element, attrs) {
                element.bind("click", function(e) {
                    $timeout(function() {
                        angular.element('body').scrollTo('div.radiusBlock.anim:first', 1000, { offset: -80 });
                    }, 500);
                });
            };
        }
    ]);

    app.directive('ngResize', ['$window', function ($window) {
            return function(scope, element, attrs) {
                angular.element($window).bind('resize', function () {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngResize);
                    });
                });
            };
        }
    ]);

    app.directive('saved', [
        '$timeout', '$compile', function($timeout, $compile) {
            return function(scope, element, attrs) {
                attrs.$observe("saved", function(_newVal) {
                    if (attrs.saved == '##METE-30##') {
                        attrs.$set('saved', '');
                        element.addClass('saved');

                        $timeout(function() {
                            element.removeClass('saved');
                        }, 2000);

                        //$compile(element)(scope);
                    }
                });
            };
        }
    ]);

    app.directive('freez', [
        '$window', function($window) {
            return function(scope, element, attrs) {
                var dif = Number(attrs.freez);
                var brk = false;

                $window.onscroll = function() {
                    var top = element[0].getBoundingClientRect().top;
                    if (!brk) brk = (document.body.scrollTop || document.documentElement.scrollTop) + top - dif;

                    if ((document.body.scrollTop || document.documentElement.scrollTop) >= brk)
                        element.css({ position: 'fixed', top: dif + 'px' });
                    else
                        element.css({ position: '', top: '' });
                };
            };
        }
    ]);

    app.directive('fly', ['$window', function($window) {
        return function (scope, element, attrs) {
            element.addClass('fly');

            var scroll = function () {
                if (element[0].getBoundingClientRect().top + 100 <= window.innerHeight) {
                    element.addClass('flyDone');
                    angular.element(document).off('scroll', scroll);
                }
            }

            angular.element(document).on('scroll', scroll);
            scroll();
        };
    }]);

    app.directive('scrollMe', [
        '$timeout', function($timeout) {
            return function(scope, element, attrs) {
                attrs.$observe("scrollMe", function(_newVal) {
                    var timeout;
                    if (scope.$eval(_newVal)) {
                        $timeout.cancel(timeout);
                        timeout = $timeout(function() {
                            angular.element('body').scrollTo(element, 1000, { offset: -100 });
                        }, 500);
                    }
                });
            };
        }
    ]);

    app.directive('ngMouse', [function() {
        return {
            scope: {
                ngMouse: '='
            },
            link: function(scope, element, attrs, ngModel) {
                element.bind("mousemove", function(e) {
                    scope.$applyAsync(function() {
                        scope.ngMouse = { x: e.clientX, y: e.clientY };
                    });
                });
            }
        };
    }]);

    app.directive('ngPath', [
        function() {
            return function(scope, element, attrs) {
                attrs.$observe("ngPath", function(_newVal) {
                    if (_newVal) {
                        element.attr('d', _newVal);
                        element.removeAttr('ng-path');
                    }
                });

            };
        }
    ]);

    app.directive('ngSvg', [
        '$compile', function($compile) {
            return function(scope, element, attrs) {
                attrs.$observe("ngSvg", function(val) {
                    val = scope.$eval(val);
                    var svg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xml:space="preserve" viewbox="' + val.viewbox + '" enable-background="new ' + val.viewbox + '"><g><path fill="#ffffff" d="' + val.path + '" /></g></svg>'
                    scope.$applyAsync(function() {
                        element.replaceWith($compile(svg)(scope));
                    });
                });

            };
        }
    ]);

    app.directive('ngReady', [
        '$timeout', function($timeout) {
            return function (scope, element, attrs) {
                 element.ready(function () {
                    scope.$applyAsync(function() {
                        $timeout(function() {
                            scope.$eval(attrs.ngReady);
                        }, 100);
                    });
                });

            };
        }
    ]);

    app.directive('cover', ['$timeout', '$compile', function($timeout, $compile) {
        return {
            scope: true,
            link: function(scope, element, attrs) {
                element.css({ width: '100%', height: '100%' });
                scope.loading = true;
                var tpl = angular.element('<span class="loadingDrv disable small" ng-hide="!loading"><i class="material-icons noI md-spin">autorenew</i></span>');
                element.parent().append(tpl);

                scope.$applyAsync(function () {
                    $compile(tpl)(scope);
                    setTimeout(function () {
                        tpl.removeClass('disable');
                    }, 100);
                });

                element.load(function() {
                    scope.$applyAsync(function() {
                        var elm = element;

                        var parent = elm.parent();
                        while (!parent[0].clientWidth || !parent[0].clientHeight) {
                            parent = parent.parent();
                        }
                        console.info();

                        elm.css({ width: '', height: '' });
                        var n = {};
                        var p = {
                            w: parent[0].clientWidth,
                            h: parent[0].clientHeight
                        };
                        var e = {
                            w: elm[0].clientWidth,
                            h: elm[0].clientHeight
                        };

                        if (e.h * p.w / e.w >= p.h) {
                            n = {
                                //w: p.w+'px',
                                //h: (e.h*p.w/e.w)+'px'
                                w: '100%',
                                h: 'auto'
                            }
                        } else {
                            n = {
                                //w: (e.w*p.h/e.h)+'px',
                                //h: p.h+'px'
                                w: 'auto',
                                h: '100%'
                            }
                        }
                        elm.css({ width: n.w, height: n.h });
                        scope.loading = false;
                    });
                })

            }
        }
    }]);

    app.directive('loading', ['$compile', function($compile) {
        return {
            scope: true,
            link: function (scope, element, attrs) {
                var small = (angular.isDefined(attrs.small) ? ' small' : '');
                var tpl = angular.element('<span class="loadingDrv disable' + small + '" ng-hide="!loading"><i class="material-icons noI md-spin">autorenew</i></span>');
                element.append(tpl);

                scope.$applyAsync(function () {
                    $compile(tpl)(scope);
                    setTimeout(function () {
                        tpl.removeClass('disable');
                    }, 100);
                });

                attrs.$observe("loading", function (_newVal) {
                    scope.$evalAsync(function () {
                        if (scope.$eval(_newVal))
                            scope.loading = true;
                        else
                            scope.loading = false;
                    });
                });
            }
        };
    }]);

    app.directive('template', ['$compile', function($compile) {
        return function(scope, element, attrs) {
            attrs.$observe("template", function(_newVal) {
                scope.$applyAsync(function() {
                    element.html($compile(_newVal)(scope));
                });
            });

        };
    }]);

    app.directive('stickBo', ['$window', function ($window) {
        return function (scope, element, attrs) {
            angular.element($window).on('scroll', function () {
                var top = Number(attrs.stickBo);
                if ((document.body.scrollTop || document.documentElement.scrollTop) > top)
                    element.addClass('active');
                else
                    element.removeClass('active');
            });
        };
    }]);

    app.directive('removeDx', ['$window', function ($window) {
        return function (scope, element, attrs) {
            element.bind("mousemove", function (event) {
                return;
                element.find('text [dx]').removeAttr('dx');
                element.find('text [x]').removeAttr('x');
                element.find('text [dy]').removeAttr('dy');
            });
        };
    }]);

    app.directive('focusme', [
        '$timeout', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs, ngModel) {
                    attrs.$observe("focusme", function(_newVal) {
                        scope.$applyAsync(function() {
                            if ((typeof _newVal == 'string' && _newVal.length == 7 && _newVal.substr(0, 1) == '#') || scope.$eval(_newVal))
                                $timeout(function() {
                                    element[0].focus();
                                }, 100);
                        });
                    });
                }
            };
        }
    ]);

    app.directive('ngDragdiff', function() {
        return function(scope, element, attrs) {

            element.bind('mousedown', function(e1) {
                var first = [e1.clientX, e1.clientY];
                var last = first;

                element.bind('mousemove', function(e2) {
                    scope[attrs.ngDragdiff]({
                        total: [e2.clientX - first[0], e2.clientY - first[1]],
                        last: [e2.clientX - last[0], e2.clientY - last[1]]
                    });
                    last = [e2.clientX, e2.clientY];

                    e2.stopPropagation();
                    e2.preventDefault();
                });
            });
            element.bind('mouseup mouseleave', function() {
                element.unbind('mousemove');
            });
        };
    });

    app.directive('number', [
        function() {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    attrs.$set('ngTrim', "false");

                    var formatter = function(str) {
                        return String(str).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                    }

                    var parseNumber = function (val) {
                        if (val && typeof val == 'string')
                            val = val.toEnglishDigits();

                        var modelString = formatter(ngModel.$modelValue);
                        var newVal = Number(String(val).replace(/[^0-9]/g, ''));
                        if (modelString === String(val)) return (!val && val !== 0 ? '' : newVal);

                        newVal = Math.max((attrs.min ? Number(attrs.min) : newVal), newVal);
                        newVal = Math.min((attrs.max ? Number(attrs.max) : newVal), newVal);

                        var viewVal = angular.copy(newVal);
                        if (attrs.number == 'price') viewVal = formatter(viewVal);

                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(viewVal);
                            ngModel.$render();
                        });

                        return Number(newVal);
                    }

                    ngModel.$parsers.push(parseNumber);
                    ngModel.$formatters.push(parseNumber);
                }
            };
        }
    ]);

    app.directive('numStr', [
        function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    attrs.$set('ngTrim', "false");

                    ngModel.$parsers.push(function (val) {
                        if (val && typeof val == 'string')
                            val = val.toEnglishDigits();

                        var newVal = String(val).replace(/[^0-9]/g, '');

                        if (attrs.max)
                            newVal = newVal.substr(0, (attrs.max ? Number(attrs.max) : newVal.length));

                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(newVal);
                            ngModel.$render();
                        });
                        return newVal;
                    });
                }
            };
        }
    ]);

    app.directive('text', [
        function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    ngModel.$parsers.push(function (val) {
                        if (val && typeof val == 'string')
                            val = val.toEnglishDigits();

                        var newVal;
                        if (attrs.text == 'en')
                            newVal = String(val).replace(/[^a-zA-Z]/g, '');
                        else
                            newVal = String(val).replace(/[0-9]/g, '');

                        newVal = newVal.substr(0, (attrs.max ? Number(attrs.max) : newVal.length));

                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(newVal);
                            ngModel.$render();
                        });
                        return newVal;
                    });
                }
            };
        }
    ]);

    app.directive('alef', [
        function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    var parser = function(val) {
                        if (!val || val[0] != 'ا') return val;
                        val = ' ' + val;
                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(val);
                            ngModel.$render();
                        });
                        return val;
                    };

                    ngModel.$parsers.push(parser);
                    ngModel.$formatters.push(parser);
                }
            };
        }
    ]);

    app.directive('mltList', [
        function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {

                    scope.mltList = __(scope, attrs.mltList);
                    var mltValue = scope.$eval(angular.toJson(scope.$eval(attrs.mltValue)));

                    scope.$watch(attrs.mltList, function(val) {
                        scope.$applyAsync(function() {
                            var idx = _.findIndex(val, mltValue); // val.indexOf(mltValue);
                            var newValue = (idx == -1 ? false : true);
                            var _scope = element.find('input').scope();
                            _scope.model = newValue;
                            _scope.change();
                        });
                    }, true);

                    ngModel.$parsers.push(function(val) {
                        scope.$applyAsync(function() {
                            if (!(scope.mltList instanceof Array))
                                scope.mltList = [];

                            var list = scope.$eval(angular.toJson(scope.mltList));
                            var idx = _.findIndex(list, mltValue); // scope.mltList.indexOf(mltValue);

                            if (val && idx == -1)
                                scope.mltList.push(mltValue);
                            else if (!val && idx != -1)
                                scope.mltList.splice(idx, 1);
                        });

                        return val;
                    });
                }
            };
        }
    ]);

    app.directive('editableInput', [
        function() {
            return {
                restrict: 'A',
                scope: true,
                replace: true,
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    scope.change = function() {
                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(angular.copy(scope.model));
                            ngModel.$render();
                        });
                    };
                    ngModel.$formatters.push(function(val) {
                        scope.model = angular.copy(val);
                        scope.change();
                        return val;
                    });
                },
                templateUrl: 'input.html'
            };
        }
    ]);

    app.directive('checkbox', [
        function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                replace: true,
                scope: {
                    ngModel: '='
                },
                link: function(scope, element, attrs, ngModel) {

                    scope.change = function() {
                        //if (scope.model === ngModel.$viewValue) return;

                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(angular.copy(scope.model));
                            ngModel.$render();
                            scope.ngModel = angular.copy(scope.model);
                        });
                    };
                    var catchChanges = function(val) {
                        scope.model = angular.copy(val);
                        if (!(typeof scope.model == 'boolean' || typeof scope.model == 'number'))
                            scope.model = false;
                        scope.change();
                        return val;
                    }
                    ngModel.$formatters.push(function(val) {
                        if (attrs.mltList)
                            return val;
                        catchChanges(val);
                    });
//            ngModel.$parsers.push(function(val) {
//                catchChanges(val);
//            });
                    attrs.$observe("ngDisabled", function(_newVal) {
                        scope.$applyAsync(function() {
                            scope.disable = scope.$eval(_newVal);
                        });
                    });
                },
                template: '<div class="customInput"><input type="checkbox" ng-model="model" ng-change="change()" ng-disabled="disable" /><i class="fa" ng-class="model?\'fa-check-square\':\'fa-square-o\'"></i></div>'
            };
        }
    ]);

    app.directive('radio', [
        function() {
            return {
                restrict: 'A',
                scope: true,
                replace: {},
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    scope.value = attrs.value;
                    scope.change = function() {
                        scope.$applyAsync(function() {
                            ngModel.$setViewValue(angular.copy(scope.model));
                            ngModel.$render();
                        });
                    };
                    ngModel.$formatters.push(function(val) {
                        scope.model = angular.copy(val);
                        scope.change();
                        return val;
                    });
                },
                template: '<div class="customInput radio"><input class="fakeHide" type="radio" ng-model="model" value="{{value}}" ng-change="change()"/><i class="fa" ng-class="model==value?\'fa-dot-circle-o\':\'fa-circle-o\'"></i></div>'
            };
        }
    ]);

    app.directive('rePass', function() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue, $scope) {
                    var noMatch = viewValue != scope.chanePassForm.pass.$viewValue;
                    ctrl.$setValidity('noMatch', !noMatch);
                    return viewValue;
                });
            }
        }
    });

    app.directive('ngValidation', function () {
        return {
            require: 'ngModel',
            scope: {
                ngValidation: '='
            },
            link: function (scope, element, attrs, ngModel) {
                scope.$watch('ngValidation', function (newVal) {
                    if (!(newVal instanceof Object)) return;
                    if (!(newVal instanceof Array)) newVal = [newVal];

                    newVal.loop(function (item) {
                        ngModel.$setValidity(item.name, item.value);
                    });

                }, true);
            }
        }
    });

    app.directive('uploadFile', function () {
        return {
            scope: {
                onChange: '&'
            },
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var updateModel = function(data) {
                    scope.$applyAsync(function () {
                        console.log(data);

                        ngModel.$setViewValue(attrs.id);
                        ngModel.$render();

                        if (scope.onChange) scope.onChange();
                    });
                }

                element.on('change', function () {
                    attrs.$set('id', 'file-' + Math.floor(Math.random() * 1000));
                    updateModel(element[0]);
                });

            }
        }
    });

    app.directive('pStrength', function() {

        return {
            replace: false,
            restrict: 'EACM',
            link: function(scope, element, attrs) {

                var strength = {
                    colors: ['#F00', '#F90', '#FF0', '#9F0', '#00B300'],
                    mesureStrength: function(p) {

                        var _value = 0;
                        var _regex = /[$-/:-?{-~!"^_`\[\]]/g;

                        var _lowerLetters = /[a-z]+/.test(p);
                        var _upperLetters = /[A-Z]+/.test(p);
                        var _numbers = /[0-9]+/.test(p);
                        var _symbols = _regex.test(p);

                        var _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
                        var _passedMatches = jQuery.grep(_flags, function(el) { return el === true; }).length;

                        return (_passedMatches + Math.floor(p.length / 5)) * 10;
                        //return (p.length<7 ? 10 : (_passedMatches + Math.floor(p.length/12))*10);

                    },

                    getColor: function(s) {
                        var idx = 0, txt = '';
                        if (s <= 10) {
                            idx = 0;
                            txt = 'خیلی ضعیف';
                        } else if (s <= 20) {
                            idx = 1;
                            txt = 'ضعیف';
                        } else if (s <= 30) {
                            idx = 2;
                            txt = 'معمولی';
                        } else if (s <= 40) {
                            idx = 3;
                            txt = 'قوی';
                        } else {
                            idx = 4;
                            txt = 'خیلی قوی';
                        }

                        return { idx: idx + 1, col: this.colors[idx], status: txt };

                    }
                };

                attrs.$observe("pStrength", function(_newVal) {
                    scope.$applyAsync(function() {
                        if (_newVal) {
                            var c = strength.getColor(strength.mesureStrength(_newVal));
                            scope.status = c.status;
                            element.css({ display: 'table', margin: '1.2em auto' });
                            element.children('li')
                                .css({ "background": '#DDD' })
                                .slice(0, c.idx)
                                .css({ 'background': c.col });
                        } else {
                            element.css({ 'display': 'none' });
                        }
                    });
                });

            },
            template: '<span>{{status}}</span><li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li>'
        };

    });

    app.directive('picZoom', [
        '$timeout', function($timeout) {
            return {
                scope: {},
                link: function(scope, element, attrs, ngModel) {
                    scope.zoom = Number(attrs.zoom);
                    console.log(element, element[0].clientWidth);
                    var size = { w: element[0].clientWidth, h: element[0].clientHeight };
                    var img, parent, zoomElm;
                    var isOn = false;
                    var lastMove = { x: -1, y: -1 };

                    var css = ".zoomedImg{ width: 100%; height: 100%; position: absolute; display: block; top: 0 !important; left: 0 !important; z-index: 1; opacity: 0; transition: opacity .5s, transform .3s; }";
                    var head = document.head || document.getElementsByTagName('head')[0], style = document.createElement('style');
                    style.type = 'text/css';
                    if (style.styleSheet)
                        style.styleSheet.cssText = css;
                    else
                        style.appendChild(document.createTextNode(css));
                    head.appendChild(style);

                    element.on('mouseenter', function (e) {
                        size = { w: element[0].clientWidth, h: element[0].clientHeight };
                        img = element.find('img');
                        parent = img.parent();
                        console.log(scope.zoom, size)
                        zoomElm = angular.element('<img class="zoomedImg" src="' + img[0].src + '">').css({ 'opacity': '0', 'width': size.w * scope.zoom + 'px', 'height': size.h * scope.zoom + 'px' });

                        isOn = true;
                        parent.append(zoomElm);
                        $timeout(function() {
                            zoomElm.css('opacity', '1');
                        }, 70);

                        element.on('mousemove', function(e) {
                            var move = {
                                x: Math.floor((1 - scope.zoom) * e.offsetX / 20) * 20,
                                y: Math.floor((1 - scope.zoom) * e.offsetY / 20) * 20,
                            }
                            if (lastMove.x != move.x || lastMove.y != move.y)
                                angular.element(zoomElm).css('transform', 'translateX(' + move.x + 'px) translateY(' + move.y + 'px) translateZ(0)');
                            lastMove = move;
                        });
                    });
                    element.on('mouseleave', function(e) {
                        isOn = false;
                        element.off('mousemove');
                        zoomElm.css('opacity', '0');
                        $timeout(function() {
                            if (!isOn)
                                angular.element('.zoomedImg').remove();
                        }, 600);

                    });
                }
            };
        }
    ]);

    app.directive('dragEnter', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var el = element[0];
                el.addEventListener('dragenter', function(e) {
                    scope.dragEnter();
                    //this.classList.add('over');
                    return false;
                }, false);
            }
        };
    });

    app.directive('otherApps', function() {
        return {
            link: function(scope, element, attrs) {
                scope.apps = [
                    { url: 'http://admserver:5000', title: 'حساب کاربری', icon: 'person' },
                    { url: 'http://admserver:3010', title: 'آرشیو مدارک', icon: 'create_new_folder' },
                    { url: 'http://admserver:4010', title: 'اتاق عمل', icon: 'airline_seat_flat' },
                    { url: 'http://admserver:5000', title: 'مدیریت ملاقات ها', icon: 'schedule' },
                    { url: 'http://admserver:5000', title: 'ارزیابی', icon: 'toc' },
                    { url: 'http://admserver:5000', title: 'داروخانه', icon: 'local_pharmacy' },
                    { url: 'http://admserver:5000', title: 'رفاهی', icon: 'flight' },
                ];
            },
            template: [
                '<ul>',
                '   <li ng-repeat="i in apps">',
                '       <a ng-href="{{i.url}}">',
                '           <span class="icon"><i class="material-icons">{{i.icon}}</i></span>',
                '           <p>{{i.title}}</p>',
                '       </a>',
                '   </li>',
                '</ul>'
            ].join('')
        };
    });

    app.directive('scanIframe', function() {
        return {
            template: '<iframe src="http://localhost:3010/scanFrame" class="relCenter" style="width: 100%; height: calc(100vh - 100px); border: none;"></iframe>'
        };
    });

    app.directive('searchStatus', function() {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            template: '<div>\
                       <div class="isLoding" ng-if="isSearching">\
                           <i class="fa fa-refresh fa-spin"></i>\
                           درحال جستجو\
                       </div>\
                       <div class="nothingFound" ng-if="!isSearching && firstSearch && !stuffs.length">\
                           <i class="fa fa-exclamation-triangle"></i>\
                           موردی یافت نشد\
                       </div>\
                   </div>'
        };
    });

    app.directive('ngRightClick', [
        '$parse', function($parse) {
            return function(scope, element, attrs) {
                var fn = $parse(attrs.ngRightClick);
                element.bind('contextmenu', function(event) {
                    scope.$apply(function() {
                        event.preventDefault();
                        fn(scope, {
                            $event: event
                        });
                    });
                });
            };
        }
    ]);


    app.directive('toggleClass', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    element.toggleClass(attrs.toggleClass);
                });
            }
        };
    });

    app.directive('fadeIn', function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element, attrs) {
                $element.addClass("ng-hide-remove");
                $element.on('load', function() {
                    $element.addClass("ng-hide-add");
                });
            }
        };
    })

    app.directive('clickOutside', [
        '$document', function _clickOutside($document) {
            return {
                restrict: 'A',
                scope: {
                    clickOutside: '&'
                },
                link: function($scope, elem, attr) {
                    var classList = (attr.outsideIfNot !== undefined) ? attr.outsideIfNot.replace(', ', ',').split(',') : [];
                    if (attr.id == undefined) attr.$set('id', 'id_' + Math.random());
                    if (attr.id !== undefined) classList.push(attr.id);

                    $document.on('click contextmenu', function(e) {

                        var i = 0,
                            element;

                        if (!e.target) return;

                        for (element = e.target; element; element = element.parentNode) {
                            var id = element.id;
                            var classNames = element.className;

                            if (id !== undefined) {
                                for (i = 0; i < classList.length; i++) {
                                    if (id.indexOf(classList[i]) > -1 || typeof classNames == 'string' && classNames.indexOf(classList[i]) > -1) {
                                        return;
                                    }
                                }
                            }
                        }
                        $scope.$eval($scope.clickOutside);
                    });
                }
            };
        }
    ]);
});