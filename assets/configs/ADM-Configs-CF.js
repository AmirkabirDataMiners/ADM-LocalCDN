'use strict';

define([], function () {
    
    angular.module('ADM-Configs', [
        'ngRoute',
        'ngAnimate',
        'ngMaterial',
        'ngMessages',
        'notifModule',
        'ADM-dateTimePicker',
        'ADM-treeView'
    ])
    .provider('ADMConfig', ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', function($controllerProvider, $compileProvider, $filterProvider, $provide) {
        
        this.$get = function () {
            return this;
        };
        
        this.register = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service,
            constant: $provide.constant,
        };
        
    }])
    .config(['$locationProvider', '$routeProvider', '$mdThemingProvider', 'ADMdtpProvider', '$compileProvider', function($locationProvider, $routeProvider, $mdThemingProvider, ADMdtp, $compileProvider) {

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        var when = $routeProvider.when;
        $routeProvider.when = function (path, route) {
            route.caseInsensitiveMatch = true;
            return when.apply(this, arguments);
        };

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript|chrome-extension):/);


        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('orange');

        $mdThemingProvider.theme('pink')
            .primaryPalette('pink')
            .accentPalette('brown');

        $mdThemingProvider.theme('green')
            .primaryPalette('green')
            .accentPalette('orange');

        $mdThemingProvider.theme('deep-orange')
            .primaryPalette('deep-orange')
            .accentPalette('orange');

        $mdThemingProvider.theme('orange')
            .primaryPalette('orange')
            .accentPalette('orange');

        $mdThemingProvider.theme('red')
            .primaryPalette('red')
            .accentPalette('orange');

        $mdThemingProvider.alwaysWatchTheme(true);



        ADMdtp.setOptions({
            calType: 'jalali',
            format: 'YYYY/MM/DD',
            multiple: false,
            autoClose: true,
            dtpType: 'date'
        });

    }])
    .run(['$rootScope', 'AuthSrv', '$route', '$compile', function ($rootScope, AuthSrv, $route, $compile) {

            $rootScope.isDeviceTouch = ('ontouchstart' in window || navigator.maxTouchPoints);
            $rootScope.CDNServer = CDNServer;
            $rootScope.baseUrl = window.location.origin;

            AuthSrv.isAuth();

            angular.element(document).ready(function () {
                $rootScope.documentReady = true;
            });

            $rootScope.reload = function () {
                $route.reload();
            }

            var handleTpl = function (next) {
                $rootScope.offCanvasState = false;
                $rootScope.offCanvasDeactive = next.$$route.noTpl || false;
                $rootScope.bodyClass = next.$$route.bodyClass || '';
                $rootScope.hideTemplate = next.$$route.noTpl || false;
                $rootScope.hideSidebar = /^\/adm/i.test(next.$$route.originalPath) || next.$$route.noSidebar || false;
            }

            $rootScope.$on("$routeChangeSuccess", function (event, next, current) {
                if (next && next.$$route) {
                    $rootScope.previousRoute = current || { originalPath: '' };
                    
                    if (current)
                        handleTpl(next);
                }
            });
            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                if (next && next.$$route) {

                    if (!current) {
                        handleTpl(next);
                        setTimeout(function () {
                            angular.element('.mainPreloader').addClass('deActive');

                            setTimeout(function () {
                                angular.element('.mainPreloader').fadeOut(700);
                            }, 700);
                        }, 300);
                    }

                    loadCSS(next.$$route.css);
                }
            });

            $rootScope.stopPropogation = function(ev) {
                ev.stopPropagation();
            };
            
            $rootScope.toggle = function (item, list) {
                var idx = _.findIndex(list, { id: item.id });
                return (idx > -1 ? (list.splice(idx, 1)) : (list.push(item)));
            };

            $rootScope.exists = function (item, list) {
                return _.findIndex(list, { id: item.id }) > -1;
            };

            $rootScope.metaDataLocality = function (meta) {
                $rootScope.$applyAsync(function () {
                    $rootScope.meta = meta;
                    $rootScope.breadCrumb = [].concat(meta.parents || [], (meta.isRoot ? [] : { title: meta.title }));

                    if (!angular.element('title').attr('ng-bind')) {

                        angular.element('title').remove();
                        angular.element('meta[name="Description"]').remove();
                        angular.element('meta[name="Keywords"]').remove();
                        angular.element('meta[property="og:title"]').remove();
                        angular.element('meta[property="og:description"]').remove();

                        var description = angular.element('<meta name="Description" content="{{meta.description}}">');
                        angular.element('head').prepend(description);
                        var keyword = angular.element('<meta name="Keywords" content="{{meta.keywords}}">');
                        angular.element('head').prepend(keyword);
                        var titleOg = angular.element('<meta property="og:title" content="{{meta.title}}" />');
                        angular.element('head').prepend(titleOg);
                        var descriptionOg = angular.element('<meta property="og:description" content="{{meta.description}}" />');
                        angular.element('head').prepend(descriptionOg);
                        var title = angular.element('<title ng-bind="meta.title"></title>');
                        angular.element('head').prepend(title);

                        $rootScope.$applyAsync(function () {
                            $compile(title)($rootScope);
                            $compile(description)($rootScope);
                            $compile(keyword)($rootScope);
                            $compile(titleOg)($rootScope);
                            $compile(descriptionOg)($rootScope);
                        });

                    }

                });
            }

        }]);
    
});