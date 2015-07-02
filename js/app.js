/*constants*/
var _ZOOM_CLOSE   =  17;
var _CITY = "Vancouver";
var _PROV = "BC";
var _GREEN = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
var _RED = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
 /*global variable*/
var map;

/** 
 * Will contain all markers of interest
 * Each array element (obejct) will contain the following
 * Coordinates: longitude and latitude (remove)
 * Address: use google search
 * Category: [restaurant, supermarket, library, bar, hotspot, ]
 * Description: custom description of place
 * TODO: include in a separate JSON file
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
        name: "English Bay Beach",
        address: "V6E 1V3"        
    },
    {
        name: "Kitsilano Beach",
        address: "1499 Arbutus Street"
    },
    {
        name: "Wreck Beach",
        address: "NW Marine Dr, V6T 1Z2"
    },
    {
        name: "Grouse Mountain",
        address: "6400 Nancy Greene Way, North Vancouver"
    }
];

/* references current marker */
var markerObj = function (data, scope) {    

    var self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);
    self.visible = ko.observable(true);
    
   // self.visible.subscribe(function (visible) {
   //   self.markerObj.setVisible(visible);
   // });

    var titleString   = String(self.name());    
    var addressString = String(self.address());    

    var placeMarker = function (place) {

            var lat = place.geometry.location.lat();  // latitude from the place service
            var lon = place.geometry.location.lng();  // longitude from the place service
            //var name = placeData.formatted_address;   // name of the place from the place service

            var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: titleString
            });

            var infoWindow = new google.maps.InfoWindow({
              content: titleString//+', '+addressString
            });

            marker.infoBox = infoWindow;
            marker.name = titleString;
            marker.address = addressString;
            //add other paramters
            /*Set content to title and address for now*/
            marker.content = marker.infoBox.content;
            /*Add event clicklistener*/
            google.maps.event.addListener(marker,'click',function() {          
                openMarker(marker, scope);
            }); 

            resizeMap(lat,lon);
           
           /*return marker to be added as a property of the markerList object*/
           return marker;
    };

    var service = new google.maps.places.PlacesService(map);        
    //the search request object
    var request = {query: self.address()};

    service.textSearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            /*google marker object will be a property of the knockout marker
             * object.  This way, the listview items and the corrsponding
             * markers on the map will be tied to one object*/
            self.markerObj = placeMarker(results[0]);
        }
    }); 

};

var openMarker = function (marker, scope) {

    var searchItem = marker.title;
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' 
                  + searchItem 
                  + '&format=json&callback=wikiCallback';

    /*set a timeout of 8 seconds for the AJAX request to complete
     * otherwise
     */
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
             marker.content = '<strong>'+article+'</strong><br>'+
                              '<p>'+snippet+'</p>'+                                   
                              '<a target="_blank" href="'+url+'">Wikipedia article</a>';                                   
    
             //open marker info box
             marker.infoBox.open(map, marker);    
             //display content on sidebar
             scope.oneMarker(marker);

             clearTimeout(requestTimeout); 
        }        
    });

    marker.setIcon(_GREEN);
    map.setZoom(_ZOOM_CLOSE);
    map.panTo(marker.getPosition());

};

var viewModel = function () {

    //this here refers to ViewModel scope
    var self = this;
    
    self.oneMarker = ko.observable();

    //create a list of markers based on list
    self.markerList = ko.observableArray(
        listOfPlaces.map(function (loc) {
          return new markerObj(loc, self);
        })
      );

    self.inputAddress = ko.observable("");
    
    this.searchAddress = function () {
        if(!self.inputAddress() || self.inputAddress().length === 0) {
            alert('Invalid Entry');
        } 
        else {
            self.resetMap();
            var d = self.inputAddress().toLowerCase();
            self.markerList().forEach(function (m) {
                var s = (m.name()+' '+m.address()).toLowerCase();
                m.visible((s.indexOf(d) > -1));
                m.markerObj.setVisible(s.indexOf(d) > -1);
            });
        }        
    };

    /*JQuery snippet in order to be able to trigger search button by hitting
     * hitting the enter key in the search button */
    $("#search-field").keyup(function(e){
      if(e.keyCode == 13){
        self.searchAddress();
      }
    });

    $('.list-view').css('cursor', 'pointer');

    this.selectMarker = function (item) {

        self.resetMap();

        var m = self.markerList();

        var searchIndex = function () {
            for (var i = 0; i < m.length; i++) {
                if(m[i].name() === item.name())
                    return i;
            }
            return -1;
        };

        var id = searchIndex();  

        if(id < 0) 
            alert('Marker not found');
        else
            openMarker(m[id].markerObj, self);          

    };

    this.resetMap = function () {
        var marker = self.markerList();
        marker.forEach(function(m){
          //close all infoboxes if they're still open
          m.markerObj.infoBox.close();
          //set list item to visible 
          m.visible(true);
          //set marker visible to true
          m.markerObj.setVisible(true);
          m.markerObj.setIcon(_RED);
          resizeMap(m.markerObj.getPosition().lat(), 
                    m.markerObj.getPosition().lng());
        });

        self.oneMarker(null);

    };

};

var resizeMap = function (lat, lon) {

	var bounds = window.mapBounds; 
	bounds.extend(new google.maps.LatLng(lat, lon));
	// fit the map to the new marker
	map.fitBounds(bounds);
	// center the map
	map.setCenter(bounds.getCenter());

};

var initializeMap = function () {

    var canvas = $('#map-canvas');

    /*grab the JS vanilla portion of the jquery wrap set*/
    map = new google.maps.Map(canvas[0]);

    /* Sets the boundaries of the map based on pin locations*/
    window.mapBounds = new google.maps.LatLngBounds();

    /*apply ko bindings*/
    ko.applyBindings(new viewModel());
    
    /**
     * The following code to keep map centered when reizing window was take from
     * the following stackoverflow link:
     * http://stackoverflow.com/questions/23947904/keep-google-maps-centered-when-window-resize
     */
    google.maps.event.addListener(map, 'center_changed', function() {
	    /*a value to determine whether the map has been resized*/
	    var size = [this.getDiv().offsetWidth,this.getDiv().offsetHeight].join('x');
	    /*when the center has changed, but not the size of the map*/
	    if( !this.get('size') || size === this.get('size')){
	       this.setValues({size:size,_center:this.getCenter()});         
	    }
	    /*when the map has been resized*/
	    else{
	      google.maps.event.addListenerOnce(this,'idle',function(){
	      this.setValues({size:size,center:this.get('_center')});});      
	    }
    });
    /*trigger the resize-event to initialize the size and _center-values*/
    google.maps.event.trigger(map,'center_changed',{});

};

//wait till page is loaded
$(document).ready(function() {
  var link = 'http://maps.googleapis.com/maps/api/js?libraries=places&callback=initializeMap';
  $('body').append("<script src="+link+"></script>");
}); 

