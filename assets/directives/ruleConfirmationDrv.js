app.directive('ruleConfirmation', ['$rootScope', '$location', function ($rootScope, $location) {
    return {
        restrict: 'AE',
        scope: true,
        replace: true,
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

            scope.editTypes = [
                { id: 0, title: 'ویرایش ناپذیر' },
                { id: 1, title: 'بالا' },
                { id: 2, title: 'پایین' },
                { id: 3, title: 'بالا پایین' },
            ];

            scope.obj = scope.ruleConfirmationsForm;
            scope.data = [];
            scope.first = { cantEdit: true, title: 'موقت', editable: scope.editTypes[3], reportable: false, recursive: false, order: 1, start: true, end: false };
            scope.last = [{ cantEdit: true, title: 'آخر', editable: scope.editTypes[0], reportable: true, recursive: false, order: 0, start: false, end: true }];
            scope.item = {};
            if (!scope.obj.single)
                scope.obj.template = _.map(scope.obj.template, function (item) {
                    item.key = item.element.match(/ng-model="\S*"/)[0].replace(/(ng-model|[="]|item.|Tmp)/g, '');
                    return item;
                });

            ngModel.$formatters.push(function (val) {
                scope.data = angular.copy(val);
                if (scope.data instanceof Array && scope.data.length >= 2) {
                    scope.last = [scope.data.pop()];
                    scope.data[0].cantEdit = true;
                    scope.last[0].cantEdit = true;
                } else {
                    scope.data = [scope.first];
                }
                update();
                return val;
            });

            var update = function (callBack) {
                scope.$applyAsync(function () {
                    scope.data.loop(function (item, i) {
                        if (item.edit) {
                            if (notValid(item)) {
                                scope.editRowCancel(item);
                            } else {
                                item.edit = false;
                                delete item.backup;
                            }
                        }
                        item.order = i + 1;
                    });

                    var out = angular.copy(scope.data);
                    scope.last[0].order = out.length+1;
                    out.push(scope.last[0]);

                    ngModel.$setViewValue(out);
                    ngModel.$render();

                    if (callBack)
                        callBack();
                });
            };

            var notValid = function (row) {
                if (scope.obj.single)
                    return row.o ? false : true;
                else {
                    return _.some(scope.obj.template, function (item) {
                        var val = row[item.key];
                        if ((angular.isUndefined(val) || angular.isDefined(val) && val !== 0 && val !== false && !val) && !item.optional)
                            return true;
                        return false;
                    });
                }
            };

            scope.insertRow = function (row, idx) {
                if (notValid(row))
                    return;
                if (row.edit) {
                    scope.editRowDone(row);
                } else {
                    if (!scope.data)
                        scope.data = [];
                    var copyRow = angular.copy(row);
                    scope.data.push(copyRow);
                    angular.copy({}, row);

                    if (copyRow.reportable)
                        row.reportable = true, row.reportableLock = true;
                    if (!copyRow.editable.id) {
                        row.editable = _.findWhere(scope.editTypes, { id: 0 });
                        row.editableLock = true;
                    }
                    update();
                }
            };

            scope.removeRow = function (idx) {
                scope.data.splice(idx, 1);
                scope.$applyAsync(function () {
                    var reportable = angular.copy(scope.data[scope.data.length - 1].reportable);
                    angular.copy(reportable, scope.item.reportableLock);

                    var editable = angular.copy(scope.data[scope.data.length - 1].editable.id==0);
                    scope.item.editableLock = editable;
                });
                update();
            };

            scope.editRow = function (row) {

                if (row.cantEdit)
                    return;

                update(function () {
                    row.backup = angular.copy(row);
                    if (scope.obj.editFunc)
                        scope.obj.editFunc(row);
                    row.edit = true;
                });
            };

            scope.editRowDone = function (row) {
                if (notValid(row))
                    return;

                row.edit = false;
                delete row.backup;
                update();
            };
            scope.editRowCancel = function (row) {
                angular.copy(row.backup, row);
                delete row.backup;
                row.edit = false;
            };

            scope.selectRequestType = function(row) {
                if (!row.aggregationRequestTypes)
                    row.aggregationRequestTypes = [];
                row.aggregationRequestTypes.push(angular.copy(row.aggregationRequestTypesTmp));
                delete row.aggregationRequestTypesTmp;
            };

            scope.removeRequestType = function (row, idx) {
                row.aggregationRequestTypes.splice(idx, 1);
            };
        },
        templateUrl: assets + 'app/directive/ruleConfirmationDrv.html'
    };
}]);