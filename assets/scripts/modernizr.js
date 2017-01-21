window.Modernizr = function (a, b, c) { function v(a) { i.cssText = a } function w(a, b) { return v(prefixes.join(a + ";") + (b || "")) } function x(a, b) { return typeof a === b } function y(a, b) { return !!~("" + a).indexOf(b) } function z(a, b, d) { for (var e in a) { var f = b[a[e]]; if (f !== c) return d === !1 ? a[e] : x(f, "function") ? f.bind(d || b) : f } return !1 } var d = "2.8.3", e = {}, f = b.documentElement, g = "modernizr", h = b.createElement(g), i = h.style, j, k = {}.toString, l = {}, m = {}, n = {}, o = [], p = o.slice, q, r = function (a, c, d, e) { var h, i, j, k, l = b.createElement("div"), m = b.body, n = m || b.createElement("body"); if (parseInt(d, 10)) while (d--) j = b.createElement("div"), j.id = e ? e[d] : g + (d + 1), l.appendChild(j); return h = ["&#173;", '<style id="s', g, '">', a, "</style>"].join(""), l.id = g, (m ? l : n).innerHTML += h, n.appendChild(l), m || (n.style.background = "", n.style.overflow = "hidden", k = f.style.overflow, f.style.overflow = "hidden", f.appendChild(n)), i = c(l, a), m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n), f.style.overflow = k), !!i }, s = function (b) { var c = a.matchMedia || a.msMatchMedia; if (c) return c(b) && c(b).matches || !1; var d; return r("@media " + b + " { #" + g + " { position: absolute; } }", function (b) { d = (a.getComputedStyle ? getComputedStyle(b, null) : b.currentStyle)["position"] == "absolute" }), d }, t = {}.hasOwnProperty, u; !x(t, "undefined") && !x(t.call, "undefined") ? u = function (a, b) { return t.call(a, b) } : u = function (a, b) { return b in a && x(a.constructor.prototype[b], "undefined") }, Function.prototype.bind || (Function.prototype.bind = function (b) { var c = this; if (typeof c != "function") throw new TypeError; var d = p.call(arguments, 1), e = function () { if (this instanceof e) { var a = function () { }; a.prototype = c.prototype; var f = new a, g = c.apply(f, d.concat(p.call(arguments))); return Object(g) === g ? g : f } return c.apply(b, d.concat(p.call(arguments))) }; return e }); for (var A in l) u(l, A) && (q = A.toLowerCase(), e[q] = l[A](), o.push((e[q] ? "" : "no-") + q)); return e.addTest = function (a, b) { if (typeof a == "object") for (var d in a) u(a, d) && e.addTest(d, a[d]); else { a = a.toLowerCase(); if (e[a] !== c) return e; b = typeof b == "function" ? b() : b, typeof enableClasses != "undefined" && enableClasses && (f.className += " " + (b ? "" : "no-") + a), e[a] = b } return e }, v(""), h = j = null, e._version = d, e.mq = s, e.testStyles = r, e }(this, this.document), Modernizr.addTest("mediaqueries", Modernizr.mq("only all"));

var browserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },

    dataBrowser: [
        {string: navigator.userAgent, subString: "Edge", identity: "MS Edge"},
        {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"},
        {string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
        {string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
        {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
        {string: navigator.userAgent, subString: "Safari", identity: "Safari"},
        {string: navigator.userAgent, subString: "Opera", identity: "Opera"}
    ]

};
browserDetect.init();

var mediaSize;

if (Modernizr.mq('only screen and (max-width:599px)'))
    mediaSize = 0; // xs
else if (Modernizr.mq('only screen (min-width: 600px) and (max-width:959px)'))
    mediaSize = 1; // sm
else if (Modernizr.mq('only screen (min-width: 960px) and (max-width:1279px)'))
    mediaSize = 2; // md
else if (Modernizr.mq('only screen and (min-width:1280px)'))
    mediaSize = 3; // lg