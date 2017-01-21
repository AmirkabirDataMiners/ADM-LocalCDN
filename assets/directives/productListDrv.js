app.directive('productList', ['$timeout', '$window', '$uibModal', function ($timeout, $window, $uibModal) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: assets + '/app/directive/productListDrv.html',
        scope: {
            images: '=',
            name: '@?'
        },
        link: function (scope, element, attrs, ngModel) {

            
            scope.drv = {
                images: [],
                step: 0,
                rebuild: function() {
                    scope.$applyAsync(function() {
                        scope.drv.images = [];
                        var count = (window.innerWidth<1240 ? 4 : 5);
                        var images = angular.copy(scope.images);
                        
                        while(images.length) {
                            var tmp = [];
                            for (var i=0, _i=images.length; i<_i && i < count;i++) {
                                tmp.push(images.shift());
                            }
                            scope.drv.images.push(tmp);
                        }
                    });
                },
                moreImages: function(dir) {
                    if (scope.drv.step + dir == -1 || scope.drv.step + dir == scope.drv.images.length) return;
                    
                    scope.drv.step += dir;
                }
            }
            
            scope.drv.rebuild();

            angular.element($window).bind('resize', function(){
                scope.drv.rebuild();
                scope.$digest();
            });
        }
    };
}]);