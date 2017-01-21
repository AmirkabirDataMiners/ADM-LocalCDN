define(['app'], function (app) {
    app.register.directive('partialLogin', ['$mdDialog', function ($mdDialog) {
        return function (scope, element, attrs, ngModel) {

            loadCSS(['partialLogin']);
            require(['https://www.google.com/recaptcha/api.js?hl=fa&render=explicit']);

            element.bind("click", function (ev) {
                $mdDialog.show({
                    controller: ['$scope', '$rootScope', '$timeout', 'AuthSrv', 'notif', partialLoginCtrl],
                    templateUrl: '/app/directives/partialLoginDrv.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true
                })
                .then(function () {
                    scope.$eval(attrs.partialLogin);
                });

                setTimeout(function () {
                    angular.element('body').scrollTo(0, 500);
                }, 100);
            });

            var partialLoginCtrl = function ($scope, $rootScope, $timeout, AuthSrv, notif) {
                $scope.ctrl = {};
                $scope.user = {};

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.login = function () {
                    //return;
                    var reCapcha = grecaptcha.getResponse($scope.ctrl.captcha);
                    if (!reCapcha)
                        return notif.warn('لطفا بر روی "من ربات نیستم" کلیک کنید!');

                    grecaptcha.reset($scope.ctrl.captcha);

                    AuthSrv.login($scope.loginUser, reCapcha).then(function (res) {
                        $scope.$applyAsync(function () {
                            if (res.resultFlag) {
                                AuthSrv.renew().then(function () {
                                    notif.success('به پرتال بیمارستان میلاد خوش آمدید');
                                    $mdDialog.hide();
                                });
                            } else {
                                notif.error(res.errorMessages);
                            }
                        });
                    });
                }

                $scope.handleReCaptcha = function () {
                    $timeout(function() {
                        if ($scope.localReCaptchaLoaded) return;

                        $scope.localReCaptchaLoaded = true;
                        var cap1 = grecaptcha.render('partialLoginRecaptcha', { 'sitekey': $rootScope.reCaptchaSiteKey });

                        $scope.$evalAsync(function() {
                            $scope.ctrl.captcha = cap1;
                        });
                    }, 500);
                }

            }

        }
    }]);
});