# Vancouver Landmarks
In this simple navigable web app, I listed few (of many) favorite spots in my
hometown of Vancouver, BC.  The app mainly consists of an embeded google map
along with a clickable list view and on the map.

## Requirements

- A web broswer with Javascript enabled
	- This application was tested on the following web browsers:
		- Chrome version 41
		- Firefox version version 37

## Running the application

1. Download the [project files](http://github.com/alwesam/neighborhoodMap).
2. The directory structure should be as follows:
	* css/
		- style.css
	* js
		- app.js 
	* index.html
	* README.md
3. Launch *index.html* in a web browser of your choice (please check above requirements).
4. The app page consists of two main columns.  The left columns consists a list
   view of clickable items of places.  On the top left, you can find a search
   form to filter through the list.  The right side include a google map with
   the markers listed on the list view.
5. When either the marker or a list view item is being clicked, an Ajax request
   is made to Wikipedia and displays content related to the clicked item on the
   bottom left.
6. The search form can be used to filter through the list item.  The number of
   filtered items will be reflected on the markers shown on the map.
7. The *show all* button can be clicked to display all of the markers and items. 
