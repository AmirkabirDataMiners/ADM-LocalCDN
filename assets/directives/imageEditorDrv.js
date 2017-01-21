app.directive('imgEditor', ['$timeout', '$uibModal', function ($timeout, $uibModal) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            options: '=?',
        },
        link: function (scope, element, attrs, ngModel) {
            
            ngModel.$formatters.push(function (val) {
                if (val) scope.image = angular.copy(val);
                return val;
            });
            
            var openModal = function() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: assets + 'app/directive/imageEditorDrv.html',
                    controller: 'imageEditorDrvCtrl',
                    size: 'lg',
                    resolve: {
                        data: function () {
                            return {
                                image: scope.image,
                                options: scope.options || {},
                            };
                        }
                    }
                });

                modalInstance.result.then(function (image) {
                    scope.$applyAsync(function() {
                        scope.image = image;
                        ngModel.$setViewValue( image );
                        ngModel.$render();
                    });
                });
            }
            
            element.bind("click", function (e) {
                openModal();
            });
        }
    };
}]);

appControllers.controller('imageEditorDrvCtrl', ['$scope', '$compile', '$timeout', '$uibModalInstance', 'data', function ($scope, $compile, $timeout, $uibModalInstance, data) {

    $scope.containerSize = window.innerHeight - 2*(30+65+20);
    $scope.image = data.image;
    $scope.myCroppedImage = '';
    $scope.filterPreview = '';
    $scope.cropType = data.options.type || 'rectangle';
    var selectedFilterIdx = -1;
    
    $scope.pages = {crop:1, filters:2, view:3}
    $scope.page = $scope.pages.crop;
    
    $scope.pagesInfo = [
        {id: $scope.pages.crop, icon: 'fa-crop'},
        {id: $scope.pages.filters, icon: 'fa-paint-brush'},
        {id: $scope.pages.view, icon: 'fa-eye'},
    ];
    
    $scope.filters = [
        {id: "vintage", name: "Vintage"},
        {id: "lomo", name: "Lomo"},
        {id: "clarity", name: "Clarity"},
        {id: "sinCity", name: "Sin City"},
        {id: "sunrise", name: "Sunrise"},
        {id: "crossProcess", name: "Cross Process"},
        {id: "orangePeel", name: "Orange Peel"},
        {id: "love", name: "Love"},
        {id: "grungy", name: "Grungy"},
        {id: "jarques", name: "Jarques"},
        {id: "pinhole", name: "Pinhole"},
        {id: "oldBoot", name: "Old Boot"},
        {id: "glowingSun", name: "Glowing Sun"},
        {id: "hazyDays", name: "Hazy Days"},
        {id: "herMajesty", name: "Her Majesty"},
        {id: "nostalgia", name: "Nostalgia"},
        {id: "hemingway", name: "Hemingway"},
        {id: "concentrate", name: "Concentrate"},
    ]
        
    $scope.rendering = false;
    $scope.applyFilter = function (filter, idx, force) {
        if ($scope.rendering) return;
        
        if (filter.selected && !force) {
            $scope.filterPreview.revert(true);
            filter.selected = false;
            selectedFilterIdx == -1;
            return;
        }
        else if(selectedFilterIdx != -1) {
            $scope.filters[selectedFilterIdx].selected = false;
        }
        
        $scope.rendering = true;
        filter.selected = true;
        selectedFilterIdx = idx;
        $scope.filterPreview.revert(false);
        $scope.filterPreview[filter.id]();
        
        return $scope.filterPreview.render(function () {
            $scope.$applyAsync(function () {
                $scope.myCroppedImage = document.getElementById('filterPreview').toDataURL();
                return $scope.rendering = false;
            });
        });
    }

    var rebuildCanvas = function(idx) {
        if (idx >= $scope.filters.length) {
            
            return;
        }
        
        var item = $scope.filters[idx];
        item.rendering = true;
        if (!$scope.myCroppedImage) return;
        
        var id = 'filterThumb-'+item.id;
        angular.element('#'+id+'-img').remove();
        var img = angular.element('<img id="'+id+'-img" ng-if="imageLoaded" ng-src="{{thumbImageSrc}}" width="{{thumbImageSize.w}}" height="{{thumbImageSize.h}}"/>');
        angular.element('#'+id).append(img);
        $scope.$applyAsync(function () {
            $compile(img)($scope);
            
            Caman('#'+id+'-img', function() {
                this[item.id]();
                this.render(function() {
                    $scope.$applyAsync(function () {
                        item.rendering = false;
                        rebuildCanvas(idx+1);
                    });
                });
            });
        });
        
        
    }
    
    $scope.changePage = function(item) {
        if ($scope.needToRebuild) {
            angular.element('#filterPreview').remove();
            var img = angular.element('<img id="filterPreview" class="img-thumbnail" ng-if="imageLoaded" ng-src="{{myCroppedImage}}" width="{{cropInfo.w}}" height="{{cropInfo.h}}" />');
            angular.element('#filterPreviewContainer').append(img);
            $scope.$applyAsync(function () {
                $compile(img)($scope);
            });

            $scope.filterPreview = Caman('#filterPreview', function() {
                if (selectedFilterIdx != -1)
                    $scope.applyFilter($scope.filters[selectedFilterIdx], selectedFilterIdx, true);
            });
            
            for(var i=0,j=$scope.filters.length;i<j;i++) {
                $scope.filters[i].rendering = true;
            }
            $scope.needToRebuild = false;
            rebuildCanvas(0);
        }
        
        $scope.page = item.id;
        
    }

    $scope.loadDone = function(stat) {
        $scope.$applyAsync(function() {
            if (!stat)
                $scope.imageLoaded = true;
            
            if (!$scope.info || !$scope.info.cropWidth)
                return;
            var info = angular.copy($scope.info);
            $scope.cropInfo = {
                w: info.cropWidth,
                h: info.cropHeight
            }
            resize_image($scope.myCroppedImage, {w:150}, function(data, size) {
                $scope.thumbImageSrc = data;
                $scope.thumbImageSize = size;
            });
            $scope.needToRebuild = true;
            
        });
    }
    
    $scope.ok = function () {
        $uibModalInstance.close($scope.myCroppedImage);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
