define(['app'],
       function(app) {
    app.register.directive('nuTimepicker', ['$sce', function($sce) {
        return {
            restrict: 'E',
            scope: {
                change: '&',
                icon: '@?'
            },
            require: 'ngModel',
            templateUrl: $sce.trustAsResourceUrl(CDNServer + 'timepickerDrv.html'),
            link: function($scope, element, attrs, ngModel) {

                loadCSS(['CDN:timePicker']);

                $scope.ctrl = {
                    hours: [],
                    minutes: [],
                    isOpen: false,
                    onHour: true
                }

                $scope.open = function() {
                    $scope.$applyAsync(function() {
                        $scope.ctrl.onHour = true;
                        $scope.ctrl.isOpen = !$scope.ctrl.isOpen;
                    });
                }

                $scope.close = function () {
                    $scope.$applyAsync(function() {
                        $scope.ctrl.isOpen = false;
                    });
                }

                for (var i = 1; i <= 12; i++) {
                    $scope.ctrl.hours.push(i);
                }
                for (var i = 5; i < 60; i += 5) {
                    $scope.ctrl.minutes.push(i);
                }
                $scope.ctrl.minutes.push(0);

                var updateModel = function() {
                    $scope.$applyAsync(function() {
                        var time = {
                            h: $scope.model.h + ($scope.model.am ? 0 : 12),
                            m: $scope.model.m.zero()
                        }
                        if (time.h == 12) time.h = 0;
                        else if (time.h == 24) time.h = 12;
                        time.h = time.h.zero();

                        ngModel.$setViewValue(time.h.zero() + ':' + time.m.zero());
                        ngModel.$render();

                        $scope.change();
                    });
                }

                $scope.update = function() {
                    updateModel();
                }

                ngModel.$formatters.push(function(newVal) {
                    $scope.$applyAsync(function() {
                        if (newVal) {
                            var time = newVal.split(':');
                            time = time.toNumber();
                            time[2] = true;
                            if (time[0] >= 12) time[2] = false, time[0] -= 12;
                            if (time[0] == 0) time[0] = 12;

                            $scope.model = {
                                h: time[0],
                                m: Math.floor(time[1] / 5) * 5,
                                am: time[2]
                            }
                        } else {
                            $scope.model = {
                                h: 12,
                                m: 0,
                                am: false
                            }
                        }
                        updateModel();
                    });
                });
            }
        };
    }]);
});