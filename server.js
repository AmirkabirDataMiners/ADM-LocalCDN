var connect = require('connect');
var fs = require('fs');
var destroy = require('destroy');
var onFinished = require('on-finished');
var UglifyJS = require("uglify-js");
var bodyParser = require('body-parser');


// CDN Modules
var jsonfile = require('./cdn_modules/JSON');
var hash = require('./cdn_modules/HASH');



var app = connect()


var config = {}
var versionHolder = {}
var packages = {}




var updateDirectories = function() {
    config = jsonfile.readFileSync('configs/directories.json');
    for (var i in config)
        config[i].rgx = new RegExp(config[i].regex);
}();
var setConfigs = function(nuJSON, CB) {
    jsonfile.writeFile('configs/directories.json', nuJSON, function(err) {
        if (!err) {
            config = nuJSON;
            for (var i in config)
                config[i].rgx = new RegExp(config[i].regex);
        }
        CB(err);
    });
}

var updateVersionHolder = function() {
    versionHolder = jsonfile.readFileSync('configs/versionHolder.json');
}();
var setVersionHolder = function(nuJSON, CB) {
    jsonfile.writeFile('configs/versionHolder.json', nuJSON, function(err) {
        if (!err)
            versionHolder = nuJSON;
        CB(err);
    });
}

var updatePackages = function() {
    packages = jsonfile.readFileSync('configs/packages.json');
}();
var setPackages = function(nuJSON, CB) {
    jsonfile.writeFile('configs/packages.json', nuJSON, function(err) {
        if (!err)
            packages = nuJSON;
        CB(err);
    });
}

var addPackages = function(hashed, pkg) {
    var nuPackHash = '';
    for (var p in pkg) nuPackHash += p;
    nuPackHash = hash(nuPackHash);
    
    for (var _hash in packages) {
        var packHash = '';
        for (var p in packages[_hash]) packHash += p;
        packHash = hash(packHash);
        
        if (nuPackHash == packHash) {
            delete packages[_hash];
            fs.unlink('packages/pkg' + _hash + '.js');
            break;
        }
    }
    packages[hashed] = pkg;
    
    jsonfile.writeFileSync('configs/packages.json', packages);
}

var makeTextFile = function(name, data, callBack) {
    fs.writeFile(name, data, 'utf8', callBack);
}

var redirectTo = function(res, url) {
    res.writeHead(302, {'Content-Type': 'text/plain', 'Location': url});
    res.end();
}
var handle404Page = function(req, res, next) {
    res.writeHead(404, {
        'Location': '/404'
    });
    res.end([
        '<style>body{font-family: monospace; background: #9e9e9e; color: white; padding: 3em;} h1{font-size: 10em;} h2{font-size: 1.5em; margin: 0;} img{height: 57px; vertical-align: bottom;} p{font-size: 1.3em; border-left: 2px solid #ccc; padding: .7em; margin-left: 1em;}</style>',
        '<title>404 - Not Found</title>',
        '<h1>:)</h1>',
        '<h2><img src="http://', req.headers.host, '/logo.png" />|CDN</h2>',
        '<p>Error: </br> 404 - Not Found ...</p>'
    ].join(''));
}

var getFileConfig = function(str) {
    
    for (var i in config)
        if (config[i].rgx.test(str))
            return config[i];
    
    return config.general;
}

var getVersion = function(type, str) {
    console.log(versionHolder[type], str);
    return (versionHolder[type][str] || '1.0')
}

var rebuildUrls = function(files) {
    if (typeof files == 'string')
        files = [files];
    
    for (var i=0, j=files.length; i<j; i++) {
        var url = files[i];
        var type = getFileConfig(url);
        files[i] = type.path.substring(1) + url + type.type;
    }
    
    return (files.length==1 ? files[0] : files);
}

var responseFile = function(path, req, res, next) {

    var stream = fs.createReadStream(path.substring(1));
    stream.on('error', function(){ 
        console.log('404  -------- ', path);
        redirectTo(res, '/404');
    });
    stream.pipe(res)
    onFinished(res, function (err) {
        destroy(stream)
    });
}

var responsePackage = function(pkg, req, res, next) {        
    responseFile('/packages/' + pkg.replace('/adm/', '') + '.js', req, res, next);
}

var handleSingleFile = function(url, req, res, next) {
    var type = getFileConfig(url);
    var redirectName = '/adm/';
    var redirectRegex = new RegExp(redirectName);

    if (!redirectRegex.test(url)) {
        url = url.substring(1);
        res.writeHead(302, {
            'Location': redirectName + url + '?v=' + getVersion(type.name, url)
        });
        res.end();
        return;
    }
    var file = url.replace(redirectRegex, '');
    
    var path = type.path + file + type.type;
    
    responseFile(path, req, res, next);
}

var createVersionJson = function(list) {
    var json = {};
    
    for (var i=0, j=list.length; i<j; i++) {
        var url = list[i];
        var type = getFileConfig(url);

        json[url] = getVersion(type.name, url);
    }
    
    return json;
}

var checkIfPackageIsOld = function(hashed, newPkg) {
    var pkg = packages[hashed];
    
    if (!pkg)
        return false;
    
    return true;
}

var handleMultipleFiles = function(scripts, req, res, next) {
    
    scripts = scripts.split('&');
    var sortedScripts = [].concat(scripts).sort();
    var newPkg = createVersionJson(scripts);
    var scriptsWithVersion = sortedScripts.map(function(item) {
        return item + newPkg[item];
    }).join('&');
    
    var hashed = hash(scriptsWithVersion);
    var path = '/adm/pkg' + hashed;
    
    if (checkIfPackageIsOld(hashed, newPkg))
        return redirectTo(res, path);
    
    scripts = rebuildUrls(scripts);
    var result = UglifyJS.minify(scripts);
    makeTextFile('packages/pkg' + hashed + '.js', result.code, function() {

        addPackages(hashed, newPkg);
        
        return redirectTo(res, path);
    });
}





app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.use('/admin', function(req, res, next) {
    responseFile('/assets/views/admin.html', req, res, next);
})
app.use('/api/getVersions', function(req, res, next) {
    responseFile('/configs/versionHolder.json', req, res, next);
})
app.use('/api/getConfigs', function(req, res, next) {
    responseFile('/configs/directories.json', req, res, next);
})
app.use('/api/getPackages', function(req, res, next) {
    responseFile('/configs/packages.json', req, res, next);
})
app.use('/api/setVersion', function(req, res, next) {
    setVersionHolder(req.body, function(err) {
        res.end(JSON.stringify({
            err: err
        }));
    });
})
app.use('/api/updateConfigs', function(req, res, next) {
    setConfigs(req.body, function(err) {
        res.end(JSON.stringify({
            err: err
        }));
    });
})
app.use('/api/updatePackages', function(req, res, next) {
    setPackages(req.body, function(err) {
        res.end(JSON.stringify({
            err: err
        }));
    });
})


app.use(function (req, res, next) {

    var cleanUrl = decodeURI(req.url).split('?');
    var url = cleanUrl[0], params = cleanUrl[1];
    
    if (req.method !== 'GET')
        return next()
    
    if (url == '/404')
        return handle404Page(req, res, next);
    
    if (/\/adm\/pkg/.test(url))
        return responsePackage(url, req, res, next);
    
    if (url == '/bundle') 
        return handleMultipleFiles(params, req, res, next);

    return handleSingleFile(url, req, res, next);

})

app.listen(process.env.PORT || 30);