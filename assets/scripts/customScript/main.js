
var requireUrlArgs = String.fromCharCode.apply(String, [98, 121, 65, 68, 77]) + '&v=' + document.documentElement.getAttribute('v');
var CDNServer = document.getElementsByTagName('adm-cdn')[0].getAttribute('src') + '/';


requirejs.config({
    baseUrl: '/app',
    urlArgs: requireUrlArgs
});

require([
    CDNServer + 'customScript/utilities.js',
    'app',
    CDNServer + 'routeResolverSrv',
    CDNServer + 'notifSrv',
    CDNServer + 'globalSrv',
    'services/authSrv',
    CDNServer + 'globalDrv',
    'directives/sidebarDrv',
    'controllers/bodyCtrl',
    CDNServer + 'svg4everybody/svg4everybody.min.js'
],
        function () {
    svg4everybody();
    angular.bootstrap(document, ['app']);
});