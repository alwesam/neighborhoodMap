/**
 * Authored by Wesam Al-Haddad
 * June 2015
 * This code was linted using JSHint
 * /
 
/*constants*/
var _ZOOM_CLOSE   =  17;
var _GREEN = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
var _RED = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
/*map is a global variable*/
var map;

/** 
 * listOfPlaces is an array of Objects
 * Each array element (obejct) will contain the following
 * name: Name of landmark 
 * Address: Address (street address or postal code) 
 */
var listOfPlaces = [
    {
        name: "Capilano Suspension Bridge",
        address: "3735 Capilano Rd, North Vancouver"
    },
    {
        name: "Pacific Spirit Regional Park",
        address: "4915 W. 16th Ave"
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

/* This function will be
 * run only once  */
var markerObj = function (data, scope) {    

    /*assigning observables*/
    var self = this;
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);
    /* listview item is visible by default */
    self.visible = ko.observable(true);
    
    var titleString   = String(self.name());    
    var addressString = String(self.address());    

    /*The following code is heavily borrowed from helper.js file (project 2),
     * with changes made to fit the app requirements*/
    var placeMarker = function (place) {
            
            /*coordiantes from place service*/
            var lat = place.geometry.location.lat();  
            var lon = place.geometry.location.lng(); 

            var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: titleString,
                    icon: _RED
            });
            
            /* set marker infobox as property of marker*/
            marker.infoBox = new google.maps.InfoWindow({
              content: titleString +', '+ addressString
            });
            
            /* set name and address as properties of marker.  These properties
             * in addition to content will be tied to the oneMarker observable */
            marker.name = titleString;
            marker.address = addressString;

            /*Set content to title and address for now*/
            marker.content = marker.infoBox.content;

            /*Add event clicklistener for clicking marker*/
            google.maps.event.addListener(marker,'click',function() {          
                openMarker(marker, scope);
            }); 
            
            /*resize and center map as markers are added*/
            resizeMap(window.mapBounds, lat,lon);
           
           /*return marker to be added as a property of the markerList object*/
           return marker;
    };

    /* use Google Place Services to find coordinates from address input*/
    var service = new google.maps.places.PlacesService(map);        
    var request = {query: self.address()};
    service.textSearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            /*google marker object will be a property of the knockout marker
             * object.  This way, the listview items and the corresponding
             * markers on the map will be tied to one object*/
            self.markerObj = placeMarker(results[0]);
        }
    }); 

};

/* *
 * This function is called when a listview item or a marker is clicked
 * The input parameters are the corresponding marker and the viewModel
 * reference (scope)
 */
var openMarker = function (marker, scope) {

    /*The marker title or the landmark name will be passed as the search query
     * on Wikipedi's API link*/
    var searchItem = marker.title;
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' 
                  + searchItem 
                  + '&format=json&callback=wikiCallback';

    /*set a timeout of 8 seconds for the AJAX request to complete
     * otherwise, set marker.title to fail, thanks to Udacity AJAX course
     * for this pro-tip
     */
    var requestTimeout = setTimeout(function () {
       marker.title = 'Failed to fetch Wikipedia link';
    }, 8000);

    /* Send an AJAX request to Wikipedia*/
    $.ajax({
       url: wikiURL, 
       /*jsonp datatype is specified to be able to pass functions in JSON
        * request*/
       dataType: "jsonp",
       success: function(data) {
             /*Fetch list of articles*/
             var articles = data[1];            
             /*Fetch first (likely) article*/
             var article = articles[0];
             /*Fetch snippet of wikipedia article */
             var snippet = data[2][0];
             /*build a url of the wikipedia article of the landmark*/
             var url = 'http://en.wikipedia.org/wiki/' + article;
             /*assign content with snippet*/
             marker.content = '<p>'+snippet+'</p>'+                                   
                              '<a target="_blank" href="'+url+'">Wikipedia article</a>';                                   
    
             /*open marker info box*/
             marker.infoBox.open(map, marker);    
             /*display content on sidebar*/
             scope.oneMarker(marker);
             /*clear requestTimeout*/
             clearTimeout(requestTimeout); 
        }        
    });
  
    /*set selected landmark's marker to green*/
    marker.setIcon(_GREEN);
    /*zoom closer the selected landmark*/
    map.setZoom(_ZOOM_CLOSE);
    map.panTo(marker.getPosition());

};

var viewModel = function () {

    /*this here refers to ViewModel scope*/
    var self = this;
   
    /* oneMarker observable will track detailed information of a selected
     * marker/listview item*/ 
    self.oneMarker = ko.observable();

    /*create an observable array of markers based off list*/
    self.markerList = ko.observableArray(
        listOfPlaces.map(function (loc) {
          return new markerObj(loc, self);
        })
     );

    /*search text field is set to empty string*/ 
    self.inputAddress = ko.observable("");
    
    /*searchAddress function observable is called when selecting search button
     * or hitting enter from the form text field*/
    this.searchAddress = function () {
        /*check validity of input search query*/
        if(!self.inputAddress() || self.inputAddress().length === 0) {
            alert('Invalid Entry');
        } 
        else {
            self.resetMap();
            var d = self.inputAddress().toLowerCase();
            /*instantiate a new LatLng bounds object in order to resize maps
             * based on filtered available markers*/
            var bounds = new google.maps.LatLngBounds();
            self.markerList().forEach(function (m) {
                /* search either name or address of location*/
                var s = (m.name()+' '+m.address()).toLowerCase();
                /*if a search query matches a pattern in either the location's
                 * name or address, return true and set listview item and marker
                 * visible; if false set listview item and marker invisible */
                m.visible((s.indexOf(d) > -1));
                m.markerObj.setVisible(s.indexOf(d) > -1);
                /*resize map to zoom to selected items*/
                if (s.indexOf(d) > -1)
                  resizeMap(bounds, 
                      m.markerObj.getPosition().lat(), 
                      m.markerObj.getPosition().lng());
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

    /*another jquery snippet to change cursor to pointer when hovering over
     * listview*/
    $('.list-view').css('cursor', 'pointer');

    /*The selectMarker function observable is called when a listview item is clicked*/
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

    /*This function resets the index page and returns it to its initial state*/
    this.resetMap = function () {
        var marker = self.markerList();

        resizeMap(window.mapBounds);

        marker.forEach(function(m){
          //close all infoboxes if they're still open
          m.markerObj.infoBox.close();
          //set list item to visible 
          m.visible(true);
          //set marker visible to true
          m.markerObj.setVisible(true);
          //set marker icon to red
          m.markerObj.setIcon(_RED);
        });

        //emtpy content
        self.oneMarker(null);

    };

};

/**This function resizes and centers the map based on incoming location
 * coordinates */
var resizeMap = function (bounds, lat, lon) {
  
  if(lat !== undefined && lon !== undefined)
	  bounds.extend(new google.maps.LatLng(lat, lon));
	// fit the map to the new marker
	map.fitBounds(bounds);
	// center the map
	map.setCenter(bounds.getCenter());

  /*Enforce max zoom level */
  if (map.getZoom() > _ZOOM_CLOSE)
    map.setZoom(_ZOOM_CLOSE);

};

/** This call-back function is executed after loading the google map on the
 * app's index page  */
var initializeMap = function () {
    /*grab the element where the map canvas will be placed*/
    var canvas = $('#map-canvas');

    /*grab the JS vanilla portion of the jquery wrap set*/
    map = new google.maps.Map(canvas[0]);

    /* Sets the boundaries of the map based on marker locations*/
    window.mapBounds = new google.maps.LatLngBounds();

    /*apply ko bindings and instantiates a new viewModel*/
    ko.applyBindings(new viewModel());
    
    /**
     * The following code to keep map centered when reizing window was taken from
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

/*wait till DOM of index html page is loaded before initializing map*/
$(document).ready(function() {
  var link = 'http://maps.googleapis.com/maps/api/js?libraries=places&callback=initializeMap';
  $('body').append("<script src="+link+"></script>");
}); 
