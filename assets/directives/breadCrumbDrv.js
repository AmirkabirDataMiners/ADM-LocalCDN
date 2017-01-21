app.directive('breadCrumb', ['$rootScope', '$route', function ($rootScope, $route) {
    return {
        restrict: 'E',
        scope: {},
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            scope.routes = [];
            var baseRoutes = {
                '/patients': {
                    originalPath: false,
                    info: { icon: 'fa-medkit', name: 'مدیریت بیماران' },
                    parent: '/',
                    childs: [
                        { route: '#/patients/allPatients', name: 'بیماران', icon: 'fa-users' },
                        { route: '#/patients/addPatient', name: 'پذیرش بیمار', icon: 'fa-plus' },
                    ]
                },
                //'/rooms': {
                //    originalPath: false,
                //    info: { icon: 'fa-hospital-o', name: 'اتاق ها' },
                //    parent: '/',
                //    childs: [
                //        { route: '#/rooms/1', name: 'بیماران اتاق 1', icon: 'fa-user-md' },
                //        { route: '#/rooms/2', name: 'بیماران اتاق 2', icon: 'fa-user-md' },
                //    ]
                //},
                '/adminPanel': {
                    originalPath: false,
                    info: { icon: 'fa-user-secret', name: 'پنل مدیریت' },
                    parent: '/',
                    childs: [
                        { route: '#/adminPanel/polyClinics', name: 'درمانگاه ها', icon: 'fa-hospital-o' },
                        { route: '#/adminPanel/polyClinics/clinics', name: 'مطب ها', icon: 'fa-hospital-o' },
                        { route: '#/adminPanel/doctors', name: 'پزشکان', icon: 'fa-user-md' },
                        { route: '#/adminPanel/doctorSchedules', name: 'برنامه حضور پزشک', icon: 'fa-clock-o' },
                    ]
                }
            };

            function calcRoute(route) {
                //debugger;
                scope.routes.unshift({
                    route: route.originalPath,
                    icon: route.info.icon,
                    name: route.info.name,
                    childs: (route.childs ? route.childs : false),
                    fromRoot: route.info.fromRoot,
                });

                if (route.originalPath != '/') {
                    if (baseRoutes[route.parent]) {
                        calcRoute(baseRoutes[route.parent]);
                    } else if ($route.routes[route.parent]) {
                        calcRoute($route.routes[route.parent]);
                    }

                } 
            };

            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                if (!next.info)
                    return;

                scope.$applyAsync(function () {
                    $rootScope.routeInfo = next.info;
                    scope.routes = [];
                    calcRoute($route.routes[next.originalPath]);
                });

            });

            scope.changeChildStat = function (item, stat) {
                scope.$applyAsync(function () {
                    if (stat && item.showChilds)
                        stat = false;
                    item.showChilds = stat;
                });
            };
        },
        template:
            "<ul class='breadCrumb' ng-class='{sidebar: $root.rightSidebar}'>\
                <li ng-repeat='item in routes track by item.name' ng-click='changeChildStat(item, true)' click-outside='changeChildStat(item, false)'>\
                    <a ng-href='{{item.route?(\"#\"+item.route):\"javascript:;\"}}'>\
                        <i class='fa fa-caret-down' ng-if='item.childs'></i>\
                        <i class='fa' ng-class='item.icon'></i>\
                        {{item.fromRoot ? $root.currentPageTitle : item.name}}\
                    </a>\
                    <ul ng-if='item.childs' ng-show='item.showChilds'>\
                        <li ng-repeat='citem in item.childs track by citem.route'>\
                            <a ng-href='{{citem.route}}'>\
                                <i class='fa' ng-class='citem.icon'></i>\
                                {{citem.name}}\
                            </a>\
                        </li>\
                    </ul>\
                </li>\
            </ul>"
    };
}]);