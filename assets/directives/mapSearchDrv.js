app.directive('googleplace1', ['$timeout', function ($timeout) {
    var componentForm = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        country: 'long_name',
        postal_code: 'short_name'
    };
    var mapping = {
        street_number: 'number',
        route: 'street',
        locality: 'city',
        administrative_area_level_1: 'state',
        country: 'country',
        postal_code: 'zip'
    };
    // https://gist.github.com/VictorBjelkholm/6687484 
    // modified to have better structure for details
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '=?',
            loaded: '=',
            onChanged: '&'
        },
        link: function (scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.$watch("loaded", function() {
                if (scope.loaded) {
                    scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

                    google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                        var place = scope.gPlace.getPlace();
                        var details = place.geometry && place.geometry.location ? {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        } : {};
                        // Get each component of the address from the place details
                        // and fill the corresponding field on the form.
                        for (var i = 0; i < place.address_components.length; i++) {
                            var addressType = place.address_components[i].types[0];
                            if (componentForm[addressType]) {
                                var val = place.address_components[i][componentForm[addressType]];
                                details[mapping[addressType]] = val;
                            }
                        }
                        details.formatted = place.formatted_address;
                        details.placeId = place.place_id;
                        details.text = place.name;
                        scope.$apply(function () {
                            scope.details = details; // array containing each location component
                            element.val(place.name);
                            model.$setViewValue(element.val());
                            scope.onChanged({details:details});
                        });
                        
                    });

                }

            });


        }
    };
}]);