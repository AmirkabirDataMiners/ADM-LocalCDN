app.directive('treeView', ['$rootScope', '$route', function ($rootScope, $route) {
    return {
        restrict: 'E',
        scope: {
            childNames: '=',
            data: '=',
            targetParam: '='
        },
        require: 'ngModel',
        //replace: true,
        //transclude: true,
        link: function (scope, element, attrs, ngModel) {
            scope.total = [19, 20, 21];

            if (!(scope.childNames instanceof Array))
                scope.child = [scope.childNames], scope.single = true;
            else
                scope.child = angular.copy(scope.childNames);
            
            ngModel.$formatters.push(function (val) {
                if (val instanceof Array)
                    scope.total = val;
                updateNgModel();
                return val;
            });

            function updateNgModel() {
                ngModel.$setViewValue(scope.total);
                ngModel.$render();
            };

            scope.addId = function(id) {
                scope.$applyAsync(function() {
                    //scope.total = _.union(scope.total, [id]);
                    var idx = _.indexOf(scope.total, id);
                    if (idx == -1)
                        scope.total.push(id);
                    updateNgModel();
                });
            };

            scope.deleteId = function (id) {
                scope.$applyAsync(function() {
                    //scope.total = _.without(scope.total, id);
                    var idx = _.indexOf(scope.total, id);
                    if (idx >= 0)
                        scope.total.splice(idx, 1);
                    updateNgModel();
                });
            };

            scope.nextLvl = function ($lvl) {
                if ($lvl == scope.child.length - 1)
                    return $lvl;
                return $lvl + 1;
            };

            scope.hasChild = function (item, $lvl) {
                if (scope.single)
                    return item[scope.child[scope.nextLvl($lvl)]] ? true : false;
                else
                    return $lvl != scope.child.length - 1;

            };

            scope.changeStat = function(item, $lvl, value) {
                if (angular.isUndefined(value))
                    value = item.childMark;
                
                if (scope.hasChild(item, $lvl)) {
                    item.childMark = value;
                    var _$lvl = scope.nextLvl($lvl);

                    if (item[scope.child[_$lvl]]) {
                        for (var i = 0, j = item[scope.child[_$lvl]].length; i < j; i++) {
                            scope.changeStat(item[scope.child[_$lvl]][i], _$lvl, value);
                        }
                    }

                } else {
                    if (value)
                        scope.addId(item[scope.targetParam]);
                    else
                        scope.deleteId(item[scope.targetParam]);
                }
            };


            scope.pushParentIdx = function (item, parentsIdx, $idx, par) {
                item.parentsIdx = [];
                if (parentsIdx instanceof Array)
                    item.parentsIdx = angular.copy(parentsIdx);
                item.parentsIdx.push($idx);
            };

            function updateCounts($ite, parents, idx, $lvl, value, property) {
                if (idx == parents.length)
                    return;

                $ite[parents[idx]][property] += value;

                $item = angular.copy($ite[parents[idx]]);
                $ite[parents[idx]].childMark = ($item.totalChilds && $item.totalChildsMark == $item.totalChilds);

                var _$lvl = scope.nextLvl($lvl);
                if ($ite[parents[idx]][scope.child[_$lvl]])
                    updateCounts($ite[parents[idx]][scope.child[_$lvl]], parents, idx + 1, _$lvl, value, property);
            };

            scope.updateParents = function (item, remove) {
                var idx = _.indexOf(scope.total, item[scope.targetParam]);
                if (idx != -1)
                    updateCounts(scope.data, item.parentsIdx, 0, -1, 1, 'totalChildsMark');
                else if (remove)
                    updateCounts(scope.data, item.parentsIdx, 0, -1, -1, 'totalChildsMark');
            };

            scope.checkBoxInit = function(item, $lvl) {
                if (scope.hasChild(item, $lvl)) {
                    item.totalChildsMark = 0;
                    item.totalChilds = 0;
                } else {
                    scope.updateParents(item);
                    updateCounts(scope.data, item.parentsIdx, 0, -1, 1, 'totalChilds');
                }
            };

            scope.targetChanged = function (item, $lvl) {
                scope.updateParents(item, true);
                updateNgModel();
            };
        },
        templateUrl: assets + 'app/directive/treeViewDrv.html'
    };
}]);