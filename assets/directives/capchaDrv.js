app.directive('capcha', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        scope: {
            model: '=',
            flag: '='
        },
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            scope.url = $rootScope.baseUrl;
            scope.src = scope.url + '/pub/capcha';
            scope.refresh = function () {
                scope.src = scope.url + '/pub/capcha/' + parseInt(Math.random() * 100000) + scope.rnd;
            };
            scope.$watchCollection("[flag]", function () {
                scope.refresh();
            });

        },
        template:

            "\
            <div class='capchaContainer'>\
            <div class='imgContainer'><img ng-src='{{src}}'></div>\
            <input type='text' ng-model='model' placeholder='عدد بالا را وارد نمایید'>\
            <i class='fa fa-refresh info' toggle-class='spin' ng-click='refresh()'>\
            </<div>\
            ",

        controller: function ($scope) {

        }
    }
}]);
