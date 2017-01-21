'use strict';

define(['app'], function (app) {
    app.register.factory('ManagerSrv', ['GlobalSrv', function (GlobalSrv) {
        var managerBaseUrl = '/user/Manager/';

        return {
            profile: function (userId) {
                return GlobalSrv.cruds.get(managerBaseUrl + 'GetProfile?UserId=' + userId);
            },
            getUsers: function () {
                return GlobalSrv.cruds.get(managerBaseUrl + 'GetAllusers');
            },
            changePass: function (params) {
                return GlobalSrv.cruds.post(managerBaseUrl + 'PostChangePassword', params);
            },
            changeProfile: function (params) {
                return GlobalSrv.cruds.post(managerBaseUrl + 'PostChangeProfile', params);
            }
        };
    }]);
});