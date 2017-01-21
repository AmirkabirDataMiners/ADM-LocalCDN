String.prototype.toPersianDigits = function () {
    var id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return this.replace(/[0-9]/g, function (w) {
        return id[+w];
    });
};

String.prototype.toEnglishDigits = function () {
    var id = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
    return this.replace(/[^0-9.]/g, function (w) {
        return id[w] || w;
    });
};

String.prototype.toDate = function () {
    if (/[a-zA-Z]/.test(this))
        return new Date(this);
    return new Date(this.replace(/-/g, '/'));
};

String.prototype.zero = function (a) {
    a = Math.max(this.length, a || 2);
    return (1e4 + '' + this).slice(-a);
};

Number.prototype.zero = function (a) {
    a = Math.max(String(this).length, a || 2);
    return (1e4 + '' + String(this)).slice(-a);
};

String.prototype.hash = function () {
    return this.replace(/./g, function (c) {
        return (c.charCodeAt() + 31).zero(4);
    });
};

String.prototype.unHash = function () {
    return this.replace(/.{1,4}/g, function (d) {
        return String.fromCharCode(Number(d) - 31);
    });
};

Array.prototype.loop = function (operation, reverse) {
    var l = this.length;
    while (l--) {
        var i = this.length - l - 1;
        var j = (reverse ? (l - 1 + 1) : i);
        if (operation(this[j], i) === false) break;
    }
};

Array.prototype.toNumber = function () {
    return this.map(function (item) { return (/[^0-9.-]/.test(item) ? item : Number(item)); });
};

Date.prototype.short = function (tZero) {
    tZero = (tZero ? 2 : 1);
    return this.getFullYear() + '/' + (this.getMonth() + 1).zero(tZero) + '/' + this.getDate().zero(tZero);
}

__ = function (obj, str) {
    var result = obj;
    var keys = str.split(/[.]/g);
    while (!keys[0] && keys.length) keys.shift();
    keys.loop(function (item) {
        result = result[item];
    });
    return result;
};

function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.send();
}

function getDataUri(url, callback) {
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;

        canvas.getContext('2d').drawImage(this, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/png', 1));
    };

    image.src = url;
}

function resizeImage(url, rate, callback) {
    rate = rate || {};
    rate.q = rate.q || 1;
    rate.r = rate.r || 1;

    var image = new Image();

    image.onload = function () {
        var canvas = document.createElement('canvas');
        if (rate.w) {
            canvas.width = rate.w;
            canvas.height = this.naturalHeight * rate.w / this.naturalWidth;
        }
        else if (rate.h) {
            canvas.width = this.naturalWidth * rate.h / this.naturalHeight;
            canvas.height = rate.h;
        } else {
            canvas.width = this.naturalWidth * rate.r;
            canvas.height = this.naturalHeight * rate.r;
        }

        canvas.getContext('2d').drawImage(this, 0, 0);
        callback(canvas.toDataURL('image/png', rate.q || 1), { w: canvas.width, h: canvas.height });
    };

    image.src = url;
}

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

var fakeRaven = function () {
    angular.element(document.body).injector().get('notif').error("خطایی رخ داده است!");
}

var LS = function() {
    var adm = 'adm';
    var m = {
        f: "013901420130012801390114014701420145012801340132".unHash(),
        s: "0146013201470104014701320140".unHash(),
        g: "0134013201470104014701320140".unHash(),
        r: "0145013201400142014901320104014701320140".unHash()
    }
    try {
        window[m.f][m.s](adm, adm);
        window[m.f][m.r](adm);
        return m;
    } catch (e) {
        return false;
    }
}

var mtParse = function(a) {
    var scope = angular.element('body').scope();
    try {
        var parse = scope.$eval(a);
        return (parse===undefined?a:parse);
    } catch (e) {
        return a;
    } 
}

var $$ = function(a, b) {
    var m, a=String(a), b=(b===undefined?false:String(b));
    if (m = LS()) {
        if (!b)
            return mtParse((window[m.f][m.g](a.hash()) || "0141014801390139").unHash());
        else if (b === 'fuckIt')
            return window[m.f][m.r](a.hash());
        else
            return window[m.f][m.s](a.hash(), b.hash());
    }
    return null;
}

var MILADJSONLD = {
    "@@context": "http://schema.org",
    "@@type": "Organization",
    "name": "بیمارستان تخصصی و فوق تخصصی میلاد",
    "alternateName": "بیمارستان تخصصی و فوق تخصصی میلاد",
    "description": "بیمارستان تخصصی و فوق تخصصی هـزار تختخوابی میلاد به منظـور تأمیـن بخشی از نیـازهای درمــانی کشور و بیمه‌شدگان محتـرم سازمان تأمیـن اجتماعی, در تیر ماه 80 افتتاح گـردید.",
    "url": "http://miladhospital.com",
    "email": "info@miladhospital.com",
    "logo": {
        "@@type": "ImageObject",
        "url": "http://miladhospital.com/content/images/milad_hospital_logo.png",
        "caption": "لوگو بیمارستان تخصصی و فوق تخصصی میلاد",
        "width": "180px",
        "height": "180px"
    },
    "telephone": "+98-21-84090",
    "address": "تهران، اتوبان همت، خروجی اختصاصی برج و بیمارستان میلاد",
    "contactPoint": [
        {
            "@@type": "ContactPoint",
            "telephone": "+98-21-84090",
            "contactType": "customer service",
            "contactOption": "TollFree",
            "areaServed": "IR",
            "availableLanguage": "Persian"
        }
    ]
};