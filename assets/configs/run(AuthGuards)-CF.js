"use strict";

define(['app'], function (app) {
   
    app.run(['$rootScope', '$location', 'AuthSrv',
        function ($rootScope, $location, AuthSrv) {

            var buildUrl = function (url) {
                if (url && url.$$route) {
                    var path = url.$$route.originalPath;
                    _.each(url.params, function(value, key) {
                        path = path.replace(new RegExp(':' + key, 'ig'), value);
                    });
                    return path;
                } else {
                    return '/';
                }
            };
            var needAuth = function (url) {
                if (url.secure) return true;
                //var keyWords = (/localhost/i.test(window.location.host) ? [] : ['/adm']);
                var keyWords = ['/adm'];
                for (var i = 0, j = keyWords.length; i < j; i++) {
                    if (url.originalPath.indexOf(keyWords[i]) != -1)
                        return true;
                }
                return false;
            }

            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                if (next && next.$$route) {
                    var nextRoute = next.$$route.originalPath;
                    var toLogin = /^\/login/i.test(nextRoute);
                    var toRegister = /^\/register/i.test(nextRoute);
                    var toLoading = /^\/loading/i.test(nextRoute);

                    if (!current || !current.$$route)
                        current = false;

                    var fromLogout = current && /^\/logout/i.test(current.$$route.originalPath);
                    var fromLoading = current && /^\/loading/i.test(current.$$route.originalPath);

                    if (toLoading && !$rootScope.cacheRoute) {
                        event.preventDefault();
                        $location.path('/');
                        return;
                    }
                    else if ((toLogin || toRegister) && (fromLoading || $rootScope.user || $rootScope.cacheRoute)) {
                        if ($rootScope.user)
                            event.preventDefault();
                    }
                    else if ((needAuth(next.$$route) || toLogin || toRegister) && !$rootScope.user) {
                        var nextFull = buildUrl(next);
                        var currentFull = buildUrl(current);
                        var whereComeFrom = (toLogin || toRegister ? (fromLogout?'/':currentFull) : nextFull);

                        if (current) {
                            event.preventDefault();

                            AuthSrv.isAuth().then(function (res) {
                                if (!res) {
                                    $rootScope.cacheRoute = whereComeFrom;
                                    $location.path((toRegister ? '/register' : '/login'));
                                } else
                                    $location.path(whereComeFrom);
                            });
                        } else {
                            $rootScope.cacheRoute = whereComeFrom;
                            $location.path('/loading' + (toRegister ? '/register' : ''));
                        }
                        return;
                    }
                }
            });

        }]);

    
});