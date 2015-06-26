/*constants*/
var _CENTER = { lat: 49.28, lng: -123.12};
var _ZOOM   =  13;
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
        name: "BC Place Stadium",
        address: "777 Pacific Boulevard"
    },
    {
        name: "Granville Island",
        address: "1661 Duranleau Street"
    },
    {
        name: "Stanley Park",
        address: "V6G 1Z4"
    },
    {
        name: "Science World",
        address: "1455 Quebec Street"        
    },
    {
        name: "Vancouver Public Library",
        address: "350 West Georgia Street"
    },
    {
        name: "Commercial Drive",
        address: "Commercial Drive"
    }
];

/* references current marker */
var marker = function (data) {    

    self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);

    //var titleString   = String(data.name);    
    var titleString   = String(self.name());    
    var addressString = String(self.address());    

    var placeMarker = function (place) { 

            var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: titleString
            });

            var infoWindow = new google.maps.InfoWindow({
              content: titleString+', '+addressString
            });

            //add other paramters
            marker.infoBox = infoWindow;
            marker.name = titleString;
            marker.address = addressString;
            marker.content = marker.infoBox.content;

            markers().push(marker);

            google.maps.event.addListener(marker,'click',function() {          
                openMarker(marker);
            }); 

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

var openMarker = function (marker, scope) {


    var searchItem = marker.title;
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' 
                  + searchItem 
                  + '&format=json&callback=wikiCallback';

    var requestTimeout = setTimeout(function () {
       marker.title = 'Failed to fetch Wikipedia link';
    }, 8000);

    $.ajax({
       url: wikiURL, 
       dataType: "jsonp",
       success: function(data) {
             var articles = data[1];            
             var article = articles[0];
             var snippet = data[2][0];
             var url = 'http://en.wikipedia.org/wiki/' + article;
             marker.infoBox.content = '<strong>'+article+'</strong><br>'+
                                              '<p>'+snippet+'</p>'+                                   
                                              '<a href="'+url+'">Wikipedia article</a>';                                   
          /*
             marker.infoBox.content += '<br><br><strong>Relevant Links</strong>';  
             for (var i = 1; i < articles.length; i++) {
                  article = articles[i];
                  url = 'http://en.wikipedia.org/wiki/' + article;
                  marker.infoBox.content += '<br><a href="'+url+'">'+article+'</a>';  
              };*/
              marker.content = marker.infoBox.content;

              marker.infoBox.open(map, marker);    
              clearTimeout(requestTimeout);

              scope.oneMarker(marker);
        }        
    });

    map.setZoom(18);
    map.panTo(marker.getPosition());

};

var markers = ko.observableArray([]);
//TODO review the following!!!!
//var markers = [];

var viewModel = function () {
    //this here refers to ViewModel scope
    var self = this;
    
    self.markerList = ko.observableArray([]);
    self.oneMarker = ko.observable();

    //create a list of markers based on list
    listOfPlaces.forEach(function (loc) {
        self.markerList.push( new marker(loc) );
    });

    self.inputAddress = ko.observable("");
    //TODO review this alogrithm, use hide instead
    this.searchAddress = function () {
        //check first if searchAddress is not null
        if(!self.inputAddress() || self.inputAddress().length === 0){
            alert('Invalid Entry');
        } else {
            //reset
            self.markerList.splice(0);
            //remove markers from map
            for (var i = 0; i < markers().length; i++) {
                markers()[i].setMap(null);
            }
            //then truncate the array
            markers().splice(0);

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

    this.selectMarker = function (item) {

        var searchIndex = function () {
            for (var i = 0; i < markers().length; i++) {
                if(markers()[i].title === item.name())
                    return i;
            }
            return -1;
        };

        var id = searchIndex();  

        if(id < 0) 
            alert('Marker not found');
        else
            openMarker(markers()[id], self);          

    };

    this.resetMap = function () {
        //close all infoboxes if they're still open
        markers().forEach(function(marker){
          marker.infoBox.close();
        });
        self.oneMarker(null);
        map.setCenter(_CENTER);
        map.setZoom(_ZOOM);
    };

};

var initializeMap = function () {

    var canvas = $('#map-canvas');
    var mapOptions = {
        //vancouver coordinates
        center: _CENTER,
        zoom: _ZOOM
    };

    //grab the JS vanilla portion of the jquery wrap set
    map = new google.maps.Map(canvas[0], mapOptions);
    //apply ko bindings
    ko.applyBindings(new viewModel());
};

//wait till page is loaded
$(document).ready(function() {
  $('body').append("<script src='http://maps.googleapis.com/maps/api/js?libraries=places&callback=initializeMap'></script>");
}); 

