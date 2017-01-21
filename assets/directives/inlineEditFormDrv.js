app.directive('editableForm', ['$rootScope', '$location', function ($rootScope, $location) {
    return {
        restrict: 'AE',
        scope: true,
        replace: true,
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            var id = attrs.editableForm;
            scope.obj = scope[id];
            scope.data = [];
            scope.item = {};
            if (!scope.obj.single)
                scope.obj.template = _.map(scope.obj.template, function (item) {
                    if (!item.optional)
                        item.key = item.element.match(/ng-model="\S*"/)[0].replace(/(ng-model|[="]|item.|Tmp)/g, '');
                    return item;
                });

            ngModel.$formatters.push(function (val) {
                if (!val || !val.length) return val;
                scope.data = angular.copy(val);
                if (scope.obj.single)
                    scope.data = _.map(scope.data, function(item) {
                        return { o: item };
                    });
                if (scope.obj.onChange)
                    scope.obj.onChange();
                return val;
            });

            var update = function (callBack) {
                scope.$applyAsync(function () {
                    scope.data.loop(function (item) {
                        if (item.edit) {
                            if (notValid(item)) {
                                scope.editRowCancel(item);
                            } else {
                                delete item.backup;
                                delete item.edit;
                            }
                        }
                    });

                    var out = angular.copy(scope.data);
                    if (scope.obj.single)
                        out = _.map(out, function (item) {
                            return item.o;
                        });
                    ngModel.$setViewValue(out);
                    ngModel.$render();

                    if (scope.obj.onChange)
                        scope.obj.onChange();
                    
                    if (callBack)
                        callBack();
                });
            };

            var notValid = function(row) {
                if (scope.obj.single)
                    return row.o ? false : true;
                else {
                    return _.some(scope.obj.template, function (item) {
                        var val = row[item.key];
                        if (!item.optional && (angular.isUndefined(val) || angular.isDefined(val) && val !== 0 && val !== false && !val))
                            return true;
                        return false;
                    });
                }
            };

            scope.insertRow = function (row) {
                if (notValid(row))
                    return;
                if (row.edit) {
                    scope.editRowDone(row);
                } else {
                    if (!scope.data)
                        scope.data = [];
                    scope.data.push(angular.copy(row));
                    angular.copy({}, row);
                    update();
                }
            };

            scope.removeRow = function (idx) {
                scope.data.splice(idx, 1);
                update();
            };

            scope.editRow = function (row) {

                if (scope.obj.deleteOnly)
                    return;
                
                if (row.cantEdit)
                    return;

                update(function() {
                    row.backup = angular.copy(row);
                    if (scope.obj.editFunc)
                        scope.obj.editFunc(row);
                    row.edit = true;
                });
            };

            scope.editRowDone = function (row) {
                if (notValid(row))
                    return;

                delete row.backup;
                delete row.edit;
                update();
            };
            scope.editRowCancel = function (row) {
                angular.copy(row.backup, row);
                delete row.backup;
                delete row.edit;
            };
        },
        templateUrl: '/app/directives/inlineEditFormDrv.html'
    };
}]);