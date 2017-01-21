define(["app", CDNServer + 'magnificPopup.js'], function (app) {
    app.register.directive("lightbox", [function () {
        return {
            link: function (scope, element, attrs) {

                loadCSS(['CDN:lightbox/magnificPopup']);

                element.magnificPopup({
                    type: 'image',
                    tLoading: 'در حال بارگذاری ...',
                    mainClass: 'mfp-with-zoom',
                    zoom: {
                        enabled: true,

                        duration: 300,
                        easing: 'ease-in-out',
                        opener: function (openerElement) {
                            return openerElement.is('img') ? openerElement : openerElement.find('img');
                        }
                    },
                    image: {
                        markup: [
                            '<div class="mfp-figure">',
                            '   <div class="mfp-close"></div>',
                            '   <a download href="' + attrs.href + '"  target="_self"><div class="fa fa-download"></div></a>',
                            '   <figure>',
                            '       <div class="mfp-img"></div>',
                            '       <figcaption>',
                            '           <div class="mfp-bottom-bar">',
                            '           <div class="mfp-title"></div>',
                            '           <div class="mfp-counter"></div>',
                            '           </div>',
                            '       </figcaption>',
                            '   </figure>',
                            '</div>'
                        ].join(''),
                    }
                });
            }
        };

    }]);
});
