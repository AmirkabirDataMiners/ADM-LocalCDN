define(['app'], function(app) {
    app.register.directive('map', [
        '$timeout', function($timeout) {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {
                    element.addClass('map');

                    var insertGoogleScript = function() {
                        if (typeof google === 'object' && typeof google.maps === 'object') {
                            $timeout(function() {
                                mapDrvGlobInit();
                            }, 200);
                        } else {
                            var script = document.createElement("script");
                            script.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyCi2bXIjzOyvopu7FwLSlmSbxRAwpiWdgs&libraries=places&sensor=false&language=fa&callback=mapDrvGlobInit";
                            element[0].appendChild(script);
                        }
                    };

                    var map, marker;
                    scope.buildMap = function() {
                        $timeout(function() {
                            var pos = new google.maps.LatLng(scope.model[0] || 35.696116, scope.model[1] || 51.388231);
                            var mapCanvas = element[0];
                            var mapOptions = {
                                center: pos,
                                zoom: 16,
                                zoomControl: true,
                                scaleControl: true,
                                scrollwheel: true,
                                mapTypeControl: true,
                                disableDoubleClickZoom: false,
                                disableDefaultUI: true,
                                mapTypeId: google.maps.MapTypeId.ROADMAP,
                                styles: [{ "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "on" }, { "lightness": 33 }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2e5d4" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c5dac6" }] }, { "featureType": "poi.park", "elementType": "labels", "stylers": [{ "visibility": "on" }, { "lightness": 20 }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#c5c6c6" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#e4d7c6" }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#fbfaf7" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "visibility": "on" }, { "color": "#acbcc9" }] }]
                            }

                            map = new google.maps.Map(mapCanvas, mapOptions);
                            marker = new google.maps.Marker({
                                position: pos,
                                map: map,
                                animation: google.maps.Animation.DROP
                            });
                        }, 200);
                    }

                    ngModel.$formatters.push(function(val) {
                        if (val instanceof Array) {
                            scope.model = angular.copy(val);

                            if (marker) {
                                var pos = new google.maps.LatLng(val[0], val[1])
                                marker.setPosition(pos);
                                map.panTo(pos);
                                map.setZoom(16);
                            } else
                                insertGoogleScript();
                        }
                    });
                }
            };
        }
    ]);
});

var mapDrvGlobInit = function() {
    var $scope = angular.element('map').scope();
    $scope.$applyAsync(function() {
        $scope.buildMap();
    });
}