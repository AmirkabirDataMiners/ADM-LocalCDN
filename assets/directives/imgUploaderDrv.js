app.directive('imgUploader', ['$timeout', '$uibModal', function ($timeout, $uibModal) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            options: '=?',
            stacks: '=?',
            watermark: '=?'
        },
        link: function (scope, element, attrs, ngModel) {

            if(!(scope.stacks instanceof Array)) {
                scope.stacks = [];
            }
            
            ngModel.$formatters.push(function (val) {
                if (val) scope.image = angular.copy(val);
                return val;
            });

            
            
            function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
                if (typeof stroke == 'undefined') {
                    stroke = true;
                }
                if (typeof radius === 'undefined') {
                    radius = 5;
                }
                if (typeof radius === 'number') {
                    radius = {tl: radius, tr: radius, br: radius, bl: radius};
                } else {
                    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
                    for (var side in defaultRadius) {
                        radius[side] = radius[side] || defaultRadius[side];
                    }
                }
                ctx.beginPath();
                ctx.moveTo(x + radius.tl, y);
                ctx.lineTo(x + width - radius.tr, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
                ctx.lineTo(x + width, y + height - radius.br);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
                ctx.lineTo(x + radius.bl, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
                ctx.lineTo(x, y + radius.tl);
                ctx.quadraticCurveTo(x, y, x + radius.tl, y);
                ctx.closePath();
                if (fill) {
                    ctx.fill();
                }
                if (stroke) {
                    ctx.stroke();
                }

            }

            function watermarkedDataURL(canvas, logoSrc, text, callBack){

                var done = false;

                var tempCanvas=document.createElement('canvas');
                var tmpCtx=tempCanvas.getContext('2d');
                var cw,ch;
                cw=tempCanvas.width=canvas.width;
                ch=tempCanvas.height=canvas.height;
                tmpCtx.drawImage(canvas,0,0);


                tmpCtx.font="12px verdana";
                var textWidth=tmpCtx.measureText(text).width;

                var radius = 40;
                tmpCtx.beginPath();
                tmpCtx.arc(5+10+textWidth/2, radius+10, radius, 2*Math.PI/3, 7*Math.PI/3, false);
                tmpCtx.fillStyle="rgba(0,0,0,.35)";
                tmpCtx.fill();
                tmpCtx.closePath();

                var logo = new Image();
                logo.onload = function() {
                    var logoWidth = 2*radius-10;
                    tmpCtx.save();
                    tmpCtx.beginPath();
                    tmpCtx.arc(5+10+textWidth/2, radius+10, logoWidth/2, 0, Math.PI * 2, true);
                    tmpCtx.closePath();
                    tmpCtx.clip();
                    tmpCtx.drawImage(this, 5+10+textWidth/2-logoWidth/2, radius+10-logoWidth/2, logoWidth, logoWidth);

                    if (done) callBack(tempCanvas.toDataURL());
                    done = true;
                };
                logo.src = logoSrc;



                var txtTop = radius*2+4;
                roundRect(tmpCtx, 5, txtTop, textWidth+20, 25, 10, true, false);
                tmpCtx.fillStyle='white';
                tmpCtx.fillText(text,15,17+txtTop);
                if (done) callBack(tempCanvas.toDataURL());
                done = true;
            }


            
            
            
            
            element.on('change', function(evt) {
                if (!evt.currentTarget.files.length) return;
                var file=evt.currentTarget.files[0];
                //if (file.type.indexOf('image') == -1) return;
                
                var reader = new FileReader();
                reader.onload = function (evt) {
                    scope.$apply(function($scope){
                        scope.image=evt.target.result;
                        openModal();
                    });
                };
                reader.readAsDataURL(file);
            });
            
            var openModal = function() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: assets + 'app/directive/imgUploaderDrv.html',
                    controller: 'imgUploaderDrvCtrl',
                    size: 'lg',
                    keyboard: false,
                    backdrop: 'static',
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
                        
                        if (scope.watermark) {
                            var canvas = document.createElement('canvas');
                            var context = canvas.getContext('2d');
                            var img = new Image();

                            img.onload = function() {
                                canvas.width = this.width;
                                canvas.height = this.height;
                                context.drawImage(this, 0, 0);
                                watermarkedDataURL(canvas, scope.watermark.logo, scope.watermark.text, function(src) {
                                    scope.image = src;
                                    scope.stacks.push(src);
                                    ngModel.$setViewValue( src );
                                    ngModel.$render();
                                    element.val('');
                                });
                            }
                            img.src = image;
                        }
                        else {
                            scope.image = image;
                            scope.stacks.push(image);
                            ngModel.$setViewValue( image );
                            ngModel.$render();
                            element.val('');
                        }
                        
                    });
                }, function() {
                    element.val('');
                });
            }

            element.bind("click", function (e) {
                //openModal();
            });
        }
    };
}]);

appControllers.controller('imgUploaderDrvCtrl', ['$scope', '$compile', '$timeout', '$uibModalInstance', 'data', function ($scope, $compile, $timeout, $uibModalInstance, data) {

    $timeout(function() {
        $scope.containerSize = window.innerHeight - 2*(30+65+20);
        $scope.image = data.image;
        $scope.myCroppedImage = '';
        $scope.cropType = data.options.type || 'rectangle';
    }, 500);

    $scope.ok = function () {
        $uibModalInstance.close($scope.myCroppedImage);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);



