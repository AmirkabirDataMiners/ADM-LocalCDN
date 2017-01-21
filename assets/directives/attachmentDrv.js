app.directive('attachments', ['$uibModal', 'raven', function ($uibModal, raven) {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            spy: '=',
            patient: '='
        },
        link: function (scope, element, attrs, ngModel) {
            var modalOpen = false;
            
            ngModel.$formatters.push(function (val) {
                if (!val || !(val instanceof Array)) val=[];
                scope.data = angular.copy(val);
                return val;
            });

            var openModal = function(dragFlag) {
                if (modalOpen) return;
                modalOpen = true;
                
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '/app/directives/attachmentDrv.html',
                    controller: 'attachmentDrvCtrl',
                    size: 'expand',
                    keyboard: false,
                    backdrop: 'static',
                    resolve: {
                        dragFlag: dragFlag,
                        patient: scope.patient
                    }
                });

                modalInstance.result.then(function (data) {
                    scope.$applyAsync(function() {
                        modalOpen = false;
                        scope.data.push(data);
                        raven.success('تمامی فایل ها با موفقیت ذخیره شدند.');
                        ngModel.$setViewValue( scope.data );
                        ngModel.$render();
                    });
                }, function() {
                    modalOpen = false;
                });
            }

            element.bind("click", function (e) {
                openModal();
            });
            
            scope.$watch('spy', function (v) {
                if (v) {
                    scope.$applyAsync(function () {
                        scope.spy = false;
                        openModal(true);
                    });
                }
            });

        }
    };
}]);

appControllers.controller('attachmentDrvCtrl', ['$scope', '$timeout', 'dragFlag', 'FileUploader', '$uibModalInstance', 'patient', function ($scope, $timeout, dragFlag, FileUploader, $uibModalInstance, patient) {

    $scope.patient = patient;
    $scope.ctrl = {}
    $scope.ctrl.uploader = new FileUploader({
        url: '',
    });

    var data = [];
    var count = 0;
    if(dragFlag) {
        $timeout(function() {
            angular.element('[nv-file-over]')[0].classList.add('nv-file-over');
        }, 100);
    }

    $scope.firstVisitDateChanged = function (date) {

        $scope.$applyAsync(function () {
            date.lDate = date.lDate || new Date();
            $scope.ctrl.uploader.url = "api/Document/PostArchiveDocument?patientId=" + patient.id + "&firstVisitDate=" + date.lDate;
        });

    };
    
    
    $scope.ctrl.uploader.onSuccessItem = function (item, response, status, headers) {
        var file = {};
        $scope.$applyAsync(function() {
            data.push(file);
        });

    };
    $scope.ctrl.uploader.onCompleteAll = function () {
        $scope.$applyAsync(function() {
            if (data.length == $scope.ctrl.uploader.queue.length)
                $scope.ok();
        });
    };
    
    $scope.ok = function () {
        $uibModalInstance.close(data);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
}]);

app.directive('ngThumb', ['$window', function ($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function (item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function (file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function (scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file) || !helper.isImage(params.file)) {
                element.remove();
                return;
            }

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);