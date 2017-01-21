'use strict';

define([], function () {

    var routeResolver = function () {

        this.$get = function () {
            return this;
        };

        this.routeConfig = function () {
            var viewsDirectory = '/app/views/',
                controllersDirectory = '/app/controllers/',
                servicesDirectory = '/app/services/',
                directivesDirectory = '/app/directives/';

            return {
                setBaseDirectories: function (viewsDir, controllersDir) {
                    viewsDirectory = viewsDir;
                    controllersDirectory = controllersDir;
                },
                getControllersDirectory: function () {
                    return controllersDirectory;
                },
                getViewsDirectory: function () {
                    return viewsDirectory;
                },
                getServicesDirectory: function () {
                    return servicesDirectory;
                },
                getDirectivesDirectory: function () {
                    return directivesDirectory;
                }
            };
        }();

        this.route = function (routeConfig) {

            var resolve = function (baseName, otherDependencies, path, extra, controllerAs) {
                path = path || (baseName + '/');
                otherDependencies = otherDependencies || [];
                var routeDef = extra || {};
                routeDef.css = routeDef.css || [];
                var baseFileName = baseName.charAt(0).toLowerCase() + baseName.substr(1);
                routeDef.templateUrl = routeConfig.getViewsDirectory() + path + baseFileName + '.html?' + requireUrlArgs;
                routeDef.controller = baseName + 'Ctrl';
                if (controllerAs) routeDef.controllerAs = controllerAs;
                routeDef.resolve = {
                    load: ['$q', '$rootScope', function ($q, $rootScope) {

                        var otherDep = angular.copy(otherDependencies).map(function (item) {
                            if (item.indexOf('CDN:') != -1)
                                return CDNServer + item.replace('CDN:', '');
                            if (item.indexOf('Srv') != -1)
                                return routeConfig.getServicesDirectory() + item + '.js';
                            if (item.indexOf('Drv') != -1)
                                return routeConfig.getDirectivesDirectory() + item + '.js';

                            return item;
                        });
                        var dependencies = otherDep.concat([routeConfig.getControllersDirectory() + path + baseFileName + 'Ctrl.js']);
                        return resolveDependencies($q, $rootScope, dependencies);
                    }]
                };

                return routeDef;
            },

            resolveDependencies = function ($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function () {
                    defer.resolve();
                    $rootScope.$apply();
                });

                return defer.promise;
            };

            return {
                resolve: resolve
            }
        }(this.routeConfig);

    };

    var servicesApp = angular.module('routeResolverServices', []);

    //Must be a provider since it will be injected into module.config()    
    servicesApp.provider('routeResolver', routeResolver);
});
