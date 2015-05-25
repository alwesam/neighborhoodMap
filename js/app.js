 /*global variable*/
var map;

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

    var placeMarker = function (place) { 

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

            //TODO: change back to center so won't veer away from the hood

            markers.push(marker);
            infoMarkers.push(infoWindow);
    };

    var service = new google.maps.places.PlacesService(map);        
    //the search request object
    var request = {query: self.address()};

    service.textSearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            placeMarker(results[0]);
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

            infoMarkers.splice(0);

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

        if(id < 0) {
            alert('marker not found');
            return;
        }            

        //TODO: finish
        //var vancouver = "vancouver";
        //var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + vancouver + '&format=json&callback=wikiCallback';

        var title = markers[id].title;

        var yelpURL = 'http://api.yelp.com/v2/search/?term='+title+'&location=Commercial Drive, Vancouver, BC';

        var requestTimeout = setTimeout(function () {
           markers[id].title = 'failed to get link';
        }, 8000);

        $.ajax({
            url: yelpURL, 
            dataType: "jsonp",
            success: function(response) {          
                var info = response.businesses[0];
                var url = info.url;
                infoMarkers[id].content = '<a href="'+url+'">'+ info.name + '</a>';                                   
                infoMarkers[id].open(map, markers[id]);    
                clearTimeout(requestTimeout);
            }        
        });  

        map.setZoom(18);
        map.panTo(markers[id].getPosition());
        //self.oneMarker(item);           

    };

};

var initializeMap = function () {
    var canvas = document.getElementById('map-canvas');

    //TODO review
    /*if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    } */

    var mapOptions = {
        //vancouver coordinates
        center: { lat: 49.27, lng: -123.07},
        zoom: 15
    };
    map = new google.maps.Map(canvas, mapOptions);

};

var loadScript = function () {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'http://maps.googleapis.com/maps/api/js?libraries=places&callback=initializeMap';
  document.body.appendChild(script);
}

//window.onload = loadScript;

//wait till page is loaded
document.addEventListener('DOMContentLoaded', function() {
    //start
    //try http://stackoverflow.com/questions/9228958/how-to-check-if-google-maps-api-is-loaded
    // if (typeof google === 'object' && typeof google.maps === 'object') {...}
    //http://maps.google.com/maps/api/js?sensor=false&callback=initializeMap
    //https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&callback=initialize
    loadScript();
    //the bindings connect the view and the model
    //TODO temp fix
    setTimeout(function(){ ko.applyBindings(new viewModel()); }, 1000);
    
}); 

