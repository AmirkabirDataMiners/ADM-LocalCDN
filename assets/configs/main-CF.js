
var docElm = document.documentElement;
var requireUrlArgs = String.fromCharCode.apply(String, [98, 121, 65, 68, 77]) + '&v=' + docElm.getAttribute('v');
var CDNServer = document.getElementsByTagName('adm-cdn')[0].getAttribute('src') + '/';

Array.prototype.CDN = function () {
    return this.map(function(i) {return i.replace('CDN:', CDNServer);});
};
var loadCSS = function (list) {
    list.loop(function(url) {
        if (url.indexOf('CDN:') != -1)
            url = CDNServer + url.replace('CDN:', '') + '.css';
        else
            url = (url.indexOf('http') != -1 ? url : ('/content/stylesheets/' + url + '.css')) + '?' + requireUrlArgs;
        if (document.querySelector('link[href="' + url + '"]'))
            return;

        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;

        document.getElementsByTagName("head")[0].appendChild(link);
    });
}

requirejs.config({
    baseUrl: '/app',
    urlArgs: requireUrlArgs
});

require(([
    'CDN:utilities-CF',
    'CDN:routeResolverSrv',
    'CDN:ADM-Configs-CF',
    'app',
    'CDN:notifSrv',
    'CDN:globalSrv',
    'CDN:globalDrv',
    'CDN:globalFlt',
    'services/authSrv',
    'directives/sidebarDrv',
    'controllers/bodyCtrl',
    'CDN:svg4everybody/svg4everybody.min.js'
].concat(
    (String(docElm.getAttribute('auth'))?[]:['CDN:run(AuthGuards)-CF']))
).CDN(),
function () {
    svg4everybody();
    angular.bootstrap(document, ['app']);
});