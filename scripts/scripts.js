//var currentlyClicked = null;

//When they close the sidebar change all the markers back to their default state
$( document ).ready(function() {
	$( ".close" ).click(function() {
		for(var i=0; i<allMarkers.length;i++){
			allMarkers[i].setIcon(markerIcon);
		}
	});
	
	//var gju = require('geojson-utils.js');
	
});

var allMarkers = [];

//Initalize a new map
var map = new L.Map('map', {
        center: [43.1900, -77.6115],
        zoom: 12,
        layers: [
            new L.TileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
                attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18,
                subdomains: '1234'
            })
        ]
});

//Init sidebar
var sidebar = L.control.sidebar('sidebar', {
    position: 'left'
});

// Init Search bar
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.OpenStreetMap(),
    showMarker: true
}).addTo(map);

map.addControl(sidebar);


function init(){
    
    loadData();
    plotNeighborhoods();
}


// Pull in our JSON data
function loadData(){
        
        var url = "crimeData2.json";
        
        $.ajax({
			dataType: "json",
			url: url,
			success: function(success){
				handleGeoData(success);
			},
			type: "GET"
		});
     
}

//Called from loadData()
//This function handles sending the address from the JSON to the Google Maps API
//Which returns a latitude and longitude so we can plot them with leaflet
function handleGeoData(response){
        // for each incident, place a marker on the map
        var n;
        var coords;
        for(n=0; n<response.length; n++)
        {
            //var myLat = parseFloat(response[n].lat);
            //var lng = parseFloat(response[n].lng);
            var identifier = response[n].Identifier;
            var address = response[n].Address + "Rochester, NY";
            address = encodeURIComponent(address);
            var query = "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=true";
            
            $.ajax({
            	id: identifier,
				dataType: "json",
				url: query,
				success: function(success){
					coords = getlatlong(success);
					if(coords != ''){
						plotCrime(coords,this.id);
					}
				},
				type: "GET"
			});
        }   
}


//Actually handles plotting the crime data
function plotCrime(coords,crimeID){
	// Check if coords is undefined - if it is there means there was a problem getting those coords
	// If so just skip plotting that crime data until I figure out a better solution.
	if(! coords){

	}else{
		var marker = L.marker([coords[0], coords[1]]).addTo(map).on('click',function(){
			generateCrimeData(marker.myId,coords);
			for(var i=0; i< allMarkers.length; i++){
				allMarkers[i].setIcon(markerIcon);
			}
			marker.setIcon(highlightedIcon);
		});
		marker.myId = crimeID;
		
		allMarkers.push(marker); //Keep the markers in an array so we can easily change them when needed.
	}
	
}


//This function handles getting the data that is displayed in the side bar by passing in an ID
function generateCrimeData(crimeID,coords){
	console.log("incoming id:"+crimeID);
	 var url = "crimeData2.json";
        
     $.ajax({
     	streetCoords: coords,
		dataType: "json",
		url: url,
		success: function(response){
			var n;
			for(n=0;n<response.length;n++){
				var id = response[n].Identifier;
				//Grab the data if the current iteration is the crime we want.
				if(id == crimeID){ 
					console.log(crimeID);
					var address = response[n].Address;
					//The data has BLOCK in all of the addresses, let's just remove that.
					address = address.replace("Block",""); 
					var agency = response[n].Agency;
					var type = response[n].CrimeType;
					var time = response[n].DateTime;
					var description = response[n].Description;
					
					var string = '<h1>'+address+'</h1>';
					string += '<h2>'+type+'</h2>';
					string += '<h3>'+agency+'</h3>';
					string += '<p>Date and Time:'+time+'</p>';
					string += '<p>'+description+'</p>';
					string += '<a href="http://maps.googleapis.com/maps/api/streetview?size=800x400&location='+this.streetCoords[0]+','+this.streetCoords[1]+'&fov=90&heading=235&pitch=10&sensor=false"><img id="streetView" src="http://maps.googleapis.com/maps/api/streetview?size=400x200&location='+this.streetCoords[0]+','+this.streetCoords[1]+'&fov=90&heading=235&pitch=10&sensor=false" /></a>';
					
					sidebar.setContent(string); //Send to sidebar.
					break;
					
				}else{
					
				}
			}
		},
		type: "GET"
		});
	var visible = sidebar.isVisible();
	if(visible == false){
		sidebar.toggle();
	}
}

//Used to add the shapefile to the map.
function plotNeighborhoods(){
	var shpfile = new L.Shapefile('Neighborhoods.zip',{onEachFeature:function(feature, layer) {
    	getNumIncidents(shpfile,layer);
    	//console.log(numIncidents);
    	//console.log("here");
    	//for(var i=0; i < coords.length;
    	//layer.options.color = "#FF1900";
	}}).addTo(map);
}




// FUNCTIONALITY NOT WORKING - Will determine how many crimes take place in a neighborhood layer.
function getNumIncidents(shpfile,layer){
	console.log(shpfile);
	console.log(layer);
	var count = 0;
	/*var count = 0;
	var results = [];
	for(var i=0; i<allMarkers.length;i++){
		var lat = allMarkers[i]._latlng.lat;
		var lng = allMarkers[i]._latlng.lng;
		results = leafletPip.pointInLayer([lng, lat], layer);
		console.log(results);
		//if(results.length > 0){
		//	count++;
	//	}
		//var results = leafletPip.pointInLayer([-88, 38], gjLayer);
		//console.log(allMarkers[i]._latlng.lat);
		//console.log(allMarkers[i]._latlng.lng);
		//console.log(coords[i]);
		//console.log("done");
	}
	return count;*/
}


// Helper function for cleaning up the returned data from Google Maps API
function getlatlong(response){
	var data = response.results[0];
	if(! data){
		
	}else{
		var coords = [];
		console.log(response.results[0]);
		var myLat = response.results[0].geometry.location.lat;
		coords.push(myLat);
		var myLng = response.results[0].geometry.location.lng;
		coords.push(myLng);
		
		return coords;	
	}
}


    
