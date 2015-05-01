 /*global variable*/
var map;

var initializeMap = function () {
    var mapOptions = {
    	//vancouver coordinates
       	center: { lat: 49.27, lng: -123.07},
        zoom: 15
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
            			mapOptions);
};

/** 
 * Will contain all markers of interest
 * Each array element (obejct) will contain the following
 * Coordinates: longitude and latitude (remove)
 * Address: use google search
 * Category: [restaurant, supermarket, library, bar, hotspot, ]
 * Description: custom description of place
 * TODO: include in a separate JSON file or access commercial drive JSON file
 */
var listOfPlaces = [
    {
        name: "St. Augustine's Brewery",
        address: "2360 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Strom Crow Tavern",
        address: "1305 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Charlatan",
        address: "1447 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "Havana",
        address: "1212 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        keywords: ["Food"]
    },
    {
        name: "Turk's Coffee Bar",
        address: "1276 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        keywords: ["Coffee"]
    }
];
 

ko.bindingHandlers.map = {
    /* element: DOM element involved in the binding
     * valueAccessor: A JavaScript function that you can call to get the 
     * current model property that is involved in this binding
     * allBindings: JavaScript object that you can use to access all the model values bound to the DOM element
     */
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here

        var putMarker = function (place) { 

            var marker = new google.maps.Marker({
                    map: allBindingsAccessor().map,
                    position: place.geometry.location,
                    title: allBindingsAccessor().name()
            });

            viewModel.mapMarker = marker;

            var infoWindow = new google.maps.InfoWindow({
              content: allBindingsAccessor().name()
            });

            viewModel.infoMarker = infoWindow;
            //TODO move to do viewModel
            google.maps.event.addListener(marker, 'click', function() {
              infoWindow.open(map,marker);
            });          
        };

        var service = new google.maps.places.PlacesService(allBindingsAccessor().map);        
      // the search request object
        var request = {query: allBindingsAccessor().address()};

        service.textSearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                putMarker(results[0]);
            }
        }); 

    },

    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
        /*var latlng = new google.maps.LatLng(
        					allBindingsAccessor().latitude(), 
        					allBindingsAccessor().longitude()
        				);
        viewModel.mapMarker.setPosition(latlng);*/
    }
};

/* references current marker */
var marker = function (data) {
    //temp
    self = this;
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);

};

var viewModel = function () {
    //this here refers to ViewModel scope
    var self = this;    
    
    self.markerList = ko.observableArray([]);
    //listOfPlaces.forEach(function (loc) {
      //  self.markerList.push( new marker(loc) );
    //});

    self.value = ko.observable();

    this.searchAddress = function () {
        //alert(self.value());
        listOfPlaces.forEach(function (loc) {
            //display marker
            if(loc.name===self.value() || loc.address==self.value())
                self.markerList.push( new marker(loc) );
        });
    };
};

//wait till page is loaded
document.addEventListener('DOMContentLoaded', function() {

    //start
    initializeMap();
    //the bindings connect the view and the model
    ko.applyBindings(new viewModel());

});

