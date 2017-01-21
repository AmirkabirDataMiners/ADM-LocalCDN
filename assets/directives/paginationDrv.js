define(['app'], function (app) {
    app.register.directive('pagination', ['$sce', function ($sce) {
        return {
            scope: {
                onChange: '&',
                total: '='
            },
            require: 'ngModel',
            
            templateUrl: $sce.trustAsResourceUrl(CDNServer + 'paginationDrv.html'),
            link: function (scope, element, attrs, ngModel) {

                loadCSS(['CDN:pagination']);

                scope.ctrl = {
                    page: -1,
                    pages: [],
                    moreRight: false,
                    moreLeft: false
                }


                var calcPages = function () {
                    var pages = [];

                    for (var i = -2; i <= 2; i++) {
                        var newPage = scope.ctrl.page + i;
                        if (Math.abs(i) == 2 && (newPage <= 2 || newPage >= scope.total - 1) || Math.abs(i) != 2 && (newPage < 2 || newPage > scope.total - 1)) continue;
                        pages.push(newPage);
                    }

                    scope.$evalAsync(function () {
                        scope.ctrl.moreRight = false;
                        if (pages.length && pages[0] != 2)
                            scope.ctrl.moreRight = true;

                        scope.ctrl.moreLeft = false;
                        if (pages.length && pages[pages.length-1] != scope.total-1)
                            scope.ctrl.moreLeft = true;

                        scope.ctrl.pages = pages;
                    });
                }

                var upadteModel = function (page) {
                    scope.$evalAsync(function () {
                        //console.warn(ngModel.$modelValue, ngModel.$viewValue, scope.ctrl.page, page);
                        scope.ctrl.page = page || scope.ctrl.page;
                        calcPages();

                        if (scope.ctrl.page != ngModel.$modelValue) {
                            ngModel.$setViewValue(scope.ctrl.page);
                            ngModel.$render();
                            scope.onChange();
                        }
                    });
                }

                scope.$watch('total', function (newVal) {
                    if (newVal) calcPages();
                    else scope.total = 0;
                });

                scope.set = function (page) {
                    if (scope.ctrl.page == page) return;
                    upadteModel(page);
                }
                scope.go = function (dir) {
                    var newPage = scope.ctrl.page + dir;
                    if (newPage < 1 || newPage > scope.total) return;
                    upadteModel(newPage);
                }

                var parser = function (val) {
                    if (!val) return val;
                    upadteModel(val);
                    return val;
                };

                ngModel.$parsers.push(parser);
                ngModel.$formatters.push(parser);

            }
        }
    }]);
});