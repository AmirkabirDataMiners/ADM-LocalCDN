'use strict';

define(['app'], function (app) {
    app.register.factory('UserSrv', ['GlobalSrv', function (GlobalSrv) {
        var userBaseUrl = '/api/security/Account/';
        var rolesBaseUrl = '/api/Role/OperationGroupOfRole/';
        var usersRolesBaseUrl = '/api/Role/UsersRole/';
        var profileBaseUrl = '/user/Profile/';

        return {
            profile: function () {
                return GlobalSrv.cruds.get(profileBaseUrl + 'GetProfile');
            },
            changePass: function (params) {
                return GlobalSrv.cruds.post(profileBaseUrl + 'PostChangePassword', params);
            },
            changeProfile: function (params) {
                return GlobalSrv.cruds.post(profileBaseUrl + 'PostChangeProfile', params);
            },
            getUsersByPage: function (pageNo, searchText) {
                return GlobalSrv.cruds.get(userBaseUrl + 'GetUserDss?pageNo=' + pageNo + '&searchText=' + searchText);
            },
            getRoles: function () {
                return GlobalSrv.cruds.get(rolesBaseUrl + 'GetAllRoleListDs');
            },
            getRolesByUser: function (userId) {
                return GlobalSrv.cruds.get(usersRolesBaseUrl + 'GetUsersRoles?userId=' + userId);
            },
            updateUsersRole: function (userDs) {
                return GlobalSrv.cruds.put(usersRolesBaseUrl + 'Put', userDs);
            },
        };
    }]);
});