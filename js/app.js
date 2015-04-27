 /*global variable*/
var map;

var initializeMap = function () {
    var mapOptions = {
    	//vancouver coordinates
       	center: { lat: 49.2827, lng: -123.1207},
        zoom: 13
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
            			mapOptions);
};

/** 
 * Will contain all markers being pushed into this array of Objects
 * each array element (obejct) will contain the following
 * Coordinates: longitude and latitude
 * Address: use google search
 * Category: [restaurant, supermarket, library, bar, hotspot, ]
 * Description: custom description of place
 */
var markers = [{}];
 
/* references current marker */
var currMarker = function (data) {
};


var viewModel = function () {
 	//this here refers to ViewModel scope
	var self = this;

	self.Lat = ko.observable(49.28);
    self.Lng = ko.observable(-123.12);

};

ko.bindingHandlers.map = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        var position = new google.maps.LatLng(
        					allBindingsAccessor().latitude(), 
        					allBindingsAccessor().longitude()
        				);
        var marker = new google.maps.Marker({
                map: allBindingsAccessor().map,
                position: position,
                title: name
        });
        viewModel.mapMarker = marker;
    },

    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
        var latlng = new google.maps.LatLng(
        					allBindingsAccessor().latitude(), 
        					allBindingsAccessor().longitude()
        				);
        viewModel.mapMarker.setPosition(latlng);
    }
};

//wait till page is loaded
document.addEventListener('DOMContentLoaded', function() {

	//start
	initializeMap();
	//the bindings connect the view and the model
	ko.applyBindings(new viewModel());

});

