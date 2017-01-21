'use strict';

define(['app'], function (app) {

    app.register.factory('DocumentSrv', ['GlobalSrv', function (GlobalSrv) {
        var baseUrl = '/api/Document/';
        return {
            post: function (params) {
                return GlobalSrv.cruds.post(baseUrl + 'PostDocument', params);
            },
            delete: function (id) {
                return GlobalSrv.cruds.delete(baseUrl + 'Delete?id='+ id);
            }
        };
    }]);

});
