'use strict';

define(['app'], function (app) {
    app.register.factory('ClientsSrv', ['GlobalSrv', function (GlobalSrv) {
        var clientsBaseUrl = '/api/identityserver/client/';

        return {
            get: function () {
                return GlobalSrv.cruds.get(clientsBaseUrl + 'GetAll');
            },
            add: function (params) {
                return GlobalSrv.cruds.post(clientsBaseUrl + 'PostInsert', params);
            },
            update: function (params) {
                return GlobalSrv.cruds.fake(true);
                return GlobalSrv.cruds.put(clientsBaseUrl + 'PostChangeProfile', params);
            },
            delete: function (pageNo, searchText) {
                return GlobalSrv.cruds.fake(true);
                return GlobalSrv.cruds.delete(clientsBaseUrl + 'GetUserDss?pageNo=' + pageNo + '&searchText=' + searchText);
            }
        };
    }]);
});