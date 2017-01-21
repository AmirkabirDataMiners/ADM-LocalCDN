'use strict';

define(['app'], function (app) {
    app.register.factory('OrganizationSrv', ['GlobalSrv', function (GlobalSrv) {
        var positionBaseUrl = '/api/organization/position/';

        return {
            getPositions: function () {
                return GlobalSrv.cruds.get(positionBaseUrl + 'GetAll');
            },
            getPositionsTree: function () {
                return GlobalSrv.cruds.get(positionBaseUrl + 'GetTree');
            },
            addPosition: function (params) {
                return GlobalSrv.cruds.post(positionBaseUrl + 'Post', params);
            },
            updatePosition: function (params) {
                return GlobalSrv.cruds.put(positionBaseUrl + 'Put', params);
            },
            deletePosition: function (id) {
                return GlobalSrv.cruds.delete(positionBaseUrl + 'Delete?id=' + id);
            }
        };
    }]);
});