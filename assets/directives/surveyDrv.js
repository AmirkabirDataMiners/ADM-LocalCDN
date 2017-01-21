define(['app'], function (app) {
    app.directive('survey', ['$rootScope', '$route', function ($rootScope, $route) {
        return {
            scope: {
            },
            templateUrl: '/app/directives/surveyDrv.html',
            link: function (scope, element, attrs, ngModel) {

                loadCSS(['survey']);

                scope.ctrl = {
                    
                }

                var getSurveyQuestions = function() {
                    console.log($route.current);
                }

                var initialize = function() {
                    //getSurveyQuestions();
                }();

            }
        }
    }]);
});