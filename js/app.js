 /*global variable*/
var map;

var initializeMap = function () {
    var canvas = document.getElementById('map-canvas');
    var mapOptions = {
    	//vancouver coordinates
       	center: { lat: 49.27, lng: -123.07},
        zoom: 15
    };
    map = new google.maps.Map(canvas, mapOptions);
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
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Strom Crow Tavern",
        address: "1305 Commercial Dr, Vancouver, BC",
        keywords: ["Beer","Bar","Pub"]
    },
    {
        name: "The Charlatan",
        address: "1447 Commercial Dr, Vancouver, BC",
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
        keywords: ["Coffee"]
    }
];
 

/* references current marker */
var marker = function (data) {    

    self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);

    var titleString = String(data.name);    

    var putMarker = function (place) { 

            var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: titleString
            });

            var infoWindow = new google.maps.InfoWindow({
              content: titleString
            });

            google.maps.event.addListener(marker,'click',function() {          
                infoWindow.open(map, marker);
            }); 

            markers.push(marker);
            infoMarkers.push(infoWindow);
    };

    var service = new google.maps.places.PlacesService(map);        
    //the search request object
    var request = {query: self.address()};

    service.textSearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            putMarker(results[0]);
        }
    }); 

};

//var markers = ko.observableArray([]);
//TODO review the following!!!!
var markers = [];
var infoMarkers = [];

var viewModel = function () {
    //this here refers to ViewModel scope
    var self = this;
    
    self.markerList = ko.observableArray([]);
    this.oneMarker = ko.observable();
    //create a list of markers based on list
    listOfPlaces.forEach(function (loc) {
        self.markerList.push( new marker(loc) );
    });

    self.inputAddress = ko.observable("");

    this.searchAddress = function () {
        //check first if searchAddress is not null
        if(!self.inputAddress() || self.inputAddress().length === 0){
            alert('Invalid Entry');
        } else {
               
            //reset
            self.markerList.splice(0);

            //remove markers
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            //then truncate the array
            markers.splice(0);

            listOfPlaces.forEach(function (loc) {
                //display marker
                //search based on address and name
                var s = (loc.name+loc.address).toLowerCase();
                var d = self.inputAddress().toLowerCase();
                if(s.indexOf(d) > -1) {
                    self.markerList.push(new marker(loc) );                    
                }
            });       

        }        
        
    };

    this.zoom = function (item) {

        var searchIndex = function () {
            for (var i = 0; i < markers.length; i++) {
                if(markers[i].title === item.name())
                    return i;
            }
            return -1;
        };

        var id = searchIndex();        

        if(id > -1) {
            map.setZoom(18);
            map.panTo(markers[id].getPosition());                
            infoMarkers[id].open(map, markers[id]);
            //self.oneMarker(item);
        } else {
            alert('marker not found');
        }                

    };

};

//wait till page is loaded
document.addEventListener('DOMContentLoaded', function() {
    //start
    initializeMap();
    //the bindings connect the view and the model
    ko.applyBindings(new viewModel());
});

