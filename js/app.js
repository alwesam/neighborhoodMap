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
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Strom Crow Tavern",
        address: "1305 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Charlatan",
        address: "1447 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "Havana",
        address: "1212 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
        keywords: ["Food"]
    },
    {
        name: "Turk's Coffee Bar",
        address: "1276 Commercial Dr, Vancouver, BC",        
        description: 'fantastic',
        visible: false,
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

            viewModel.go = 'go';

            google.maps.event.addListener(marker,'click',function() {
                map.setZoom(17);
                map.setCenter(marker.getPosition());
                map.panTo(marker.getPosition());
                infoWindow.open(map,marker);
            }); 
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
        if (viewModel.go === 'go') {  
            map.setZoom(17);
            map.setCenter(viewModel.mapMarker.getPosition());
            map.panTo(viewModel.mapMarker.getPosition());
            viewModel.mapMarker.setVisible(allBindingsAccessor().visible());
            viewModel.infoMarker.open(map,viewModel.mapMarker);
            
        } 
        
    }
};

/* references current marker */
var marker = function (data) {
    //temp
    self = this;
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    this.isVisible = ko.observable(true);
};

var listItem = function (data) {
    self = this;
    this.listItem = ko.observable(data.name+", "+data.address);
};


var viewModel = function () {
    //this here refers to ViewModel scope
    var self = this;
    
    self.markerList = ko.observableArray([]);
    
    listOfPlaces.forEach(function (loc) {
        self.markerList.push( new marker(loc) );
    });

    self.listView = ko.observableArray([]);

    self.inputAddress = ko.observable("");

    this.searchAddress = function () {
        //reset
        //self.markerList.splice(1);
        self.listView.splice(0);        

        listOfPlaces.forEach(function (loc) {
            //display marker
            var s = loc.name+loc.address;
            if(s.indexOf(self.inputAddress()) > -1) {
                //self.markerList.push( new marker(loc) );
                self.listView.push(new listItem(loc));
            }
        });
    };

    this.zoom = function (item) {
        //TODO: here select and zoom on the clicked item
        //this.isVisible(true);
        //experiment
        //verdict: cannot forEach loop through observable array
        listOfPlaces.forEach(function (marker) {
            marker.visible = true;
            //self.isVisible(marker.visible);
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

