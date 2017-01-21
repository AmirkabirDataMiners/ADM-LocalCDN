'use strict';

define(['app'], function (app) {

    app.factory('AuthSrv', ['GlobalSrv', '$rootScope', '$q', function (GlobalSrv, $rootScope, $q) {
        var accountBaseUrl = '/user/Account/';
        var managerBaseUrl = '/api/user/Manager/';

        var getUserInfo = function () {

            var deferred = $q.defer();
            GlobalSrv.cruds.get(accountBaseUrl + 'GetUserInfo').then(function (res) {
                if (res && res.id) {
                    $rootScope.$applyAsync(function() {
                        $rootScope.user = res;
                        deferred.resolve(true);
                    });
                }
                else deferred.resolve(false);
            });
            return deferred.promise;
        }

        return {
            renew: getUserInfo,
            isAuth: function () {
                if ($rootScope.user)
                    return GlobalSrv.cruds.fake(true);
                return getUserInfo();
            },
            need2Factor: function (userName) {
                return GlobalSrv.cruds.get(accountBaseUrl + 'TwoAuthenticationEnable?userName=' + userName);
            },
            login: function (params) {
                return GlobalSrv.cruds.post(accountBaseUrl + 'Login', params);
            },
            logout: function () {
                return GlobalSrv.cruds.post(accountBaseUrl + 'LogOff');
            },
            register: function (params) {
                return GlobalSrv.cruds.post(accountBaseUrl + 'Register', params);
            },
            orgRegister: function (params) {
                return GlobalSrv.cruds.post(accountBaseUrl + 'OrganizationRegister', params);
            },
            userIsUnic: function (params) {
                return GlobalSrv.cruds.get(managerBaseUrl + 'CheckUserName?userName=' + params);
            },
            getPatient: function () {
                return GlobalSrv.cruds.get(patientBaseUrl + 'GetPatient');
            },
        };
    }]);

});



