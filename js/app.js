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
        visible: false,
        zoom: false,
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Strom Crow Tavern",
        address: "1305 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        zoom: false,
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Charlatan",
        address: "1447 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        zoom: false,
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "Havana",
        address: "1212 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        zoom: false,
        keywords: ["Food"]
    },
    {
        name: "Turk's Coffee Bar",
        address: "1276 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        zoom: false,
        keywords: ["Coffee"]
    }
];
 

ko.bindingHandlers.mapper = {
    /* element: DOM element involved in the binding
     * valueAccessor: A JavaScript function that you can call to get the 
     * current model property that is involved in this binding
     * allBindings: JavaScript object that you can use to access all the model values bound to the DOM element
     */
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, BindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
       
        var putMarker = function (place) { 

            var marker = new google.maps.Marker({
                    map: allBindingsAccessor().mapper,
                    position: place.geometry.location,
                    title: allBindingsAccessor().name()
            });

            viewModel.mapMarker = marker;

            //set it to false initially, don't show marker
            marker.setVisible(allBindingsAccessor().visible());

            var infoWindow = new google.maps.InfoWindow({
              content: allBindingsAccessor().name()
            });

            viewModel.infoMarker = infoWindow;    

            google.maps.event.addListener(marker,'click',function() {          
                infoWindow.open(map,marker);
            }); 

            //zoomlogic TODO
            if(allBindingsAccessor().zoom()) {
                map.setZoom(18);
                map.setCenter(viewModel.mapMarker.getPosition());
                map.panTo(viewModel.mapMarker.getPosition());                
                viewModel.infoMarker.open(map,viewModel.mapMarker);
            }

            markers.push(marker);
        };

        var service = new google.maps.places.PlacesService(allBindingsAccessor().mapper);        
      // the search request object
        var request = {query: allBindingsAccessor().address()};

        service.textSearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                putMarker(results[0]);
            }
        }); 

    },

    update: function (element, valueAccessor, allBindingsAccessor, viewModel, BindingContext) {
        // This will be called once when the binding is first applied to an element, and again whenever any observables/computeds that are accessed change/Update the DOM element based values here.
        //clickable     
      
    }
};

//var markers = ko.observableArray([]);

/* references current marker */
var marker = function (data) {    
    self = this;
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.isVisible = ko.observable(data.visible);
    this.inZoom = ko.observable(data.zoom);
};

//not good for now
var count = 0;

var viewModel = function () {
    //this here refers to ViewModel scope
    var self = this;
    
    self.markerList = ko.observableArray([]);
    this.oneMarker = ko.observable();
    //create a list of markers based on list
    listOfPlaces.forEach(function (loc) {
        self.markerList.push( new marker(loc) );
        //self.oneMarker( new marker(loc) );
    });

    self.inputAddress = ko.observable("");

    this.searchAddress = function () {
        //check first if searchAddress is not null
        if(!self.inputAddress() || self.inputAddress().length === 0){
            alert('enter somethign');
        } else {
            //reset
            self.markerList.splice(0);    
            count = 0;    

            listOfPlaces.forEach(function (loc) {
                //display marker
                //search based on address and name
                var s = (loc.name+loc.address).toLowerCase();
                var d = self.inputAddress().toLowerCase();
                //console.log(s);
                //console.log(self.inputAddress());
                if(s.indexOf(d) > -1) {
                    self.markerList.push(new marker(loc) );                    
                }
            });            
        }        
        
    };

    setInterval( function () {

            if(count < self.markerList().length) {

                var address = self.markerList()[count];
                address.isVisible(true);
                self.oneMarker(address); 
                count++;

            } 
        }, 
        0);

    this.zoom = function (item) {
        
        this.inZoom(true);
        self.oneMarker(item);

    };

};

//wait till page is loaded
document.addEventListener('DOMContentLoaded', function() {

    //start
    initializeMap();
    //the bindings connect the view and the model
    ko.applyBindings(new viewModel());

});

