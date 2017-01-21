"use strict";

define(['app'], function (app) {
    app.filter('sce', ['$sce', function ($sce) {
        return $sce.trustAsHtml;
    }]);

    app.filter('zero', [function () {
        return function (b, a) {
            b = b || '';
            a = Math.max(b.length || 0, a || 2);
            return (1e4 + '' + b).slice(-a);
        }
    }]);
    
    app.filter('overflow', [function () {
        return function(a, b) {
            if (a.length <= b) return a;
            return (a.substr(0, (b - 3) / 2) + '...' + a.substr(a.length - (b - 3) / 2, a.length));
        };
    }]);

    app.filter('time', [function () {
        return function (a) {
            if ((a.match(/:/g) || []).length == 2)
                return a.replace(':00', '');
            return a;
        }
    }]);

    app.filter('jalali', ['GlobalSrv', function (GlobalSrv) {
        return GlobalSrv.date.toJalali;
    }]);

    app.filter('dayName', [function () {
        return function (a) {
            var dayNames = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
            return dayNames[a * 1];
        }
    }]);

    app.filter('dateDayG', [function () {
        return function (date) {
            var dayNames = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

            if (typeof date == 'string')
                date = date.toDate();
            if (typeof date == 'number')
                date = new Date(date);
            date = new Date(date.short());

            return dayNames[date.getDay()];
        }
    }]);

    app.filter('monthName', [function () {
        return function (a) {
            var dayNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
            if (typeof a == 'string' && a.indexOf('/') != -1) a = a.split('/')[1];
            return dayNames[a * 1 - 1];
        }
    }]);
});