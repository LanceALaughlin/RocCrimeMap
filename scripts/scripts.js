var map = new L.Map('map', {
        center: [43.1850, -77.6115],
        zoom: 12,
        layers: [
            new L.TileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
                attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18,
                subdomains: '1234'
            })
        ]
});

var sidebar = L.control.sidebar('sidebar', {
    position: 'left'
});

map.addControl(sidebar);

function init(){
    
    //var marker = L.marker([43.1556, -77.6115]).addTo(map);
    //var start_date = '2013-11-18';
   /* var end_date = '2013-11-25';
    var event_ids = '98,99,100,103,104,149';
    var latitude_large = '43.20333823191608'
    var latitude_small = '43.11869245034604';
    var longitude_large = '-77.54431728574195';
    var longitude_small = '-77.67752651425758';
    
    var queryString = 'https://www.crimereports.com/services/crimedata/crime_list.html/'+start_date+'/'+ end_date+'/'+ event_ids + '/' + latitude_large + '/' + latitude_small + '/' + longitude_large + '/' + longitude_small + '/?limit=false';
    
    //console.log(queryString);
    loadData(queryString);*/
    plotNeighborhoods();
    loadData();
}


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


function handleGeoData(response){
        // for each incident, place a marker on the map
        var n;
        var coords;
        for(n=0; n<response.length; n++)
        {
            //var myLat = parseFloat(response[n].lat);
            //var lng = parseFloat(response[n].lng);
            var identifier = response[n].Identifier;
            console.log("before:"+identifier);
            var address = response[n].Address + "Rochester, NY";
            address = encodeURIComponent(address);
            var query = "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=true";
            
            $.ajax({
            	id: identifier,
				dataType: "json",
				url: query,
				success: function(success){
					coords = getlatlong(success);
					console.log("after:"+this.id);
					plotCrime(coords,this.id);
				},
				type: "GET"
			});
        }   
}


function plotCrime(coords,crimeID){
	console.log(coords);
	console.log(crimeID);
	var marker = L.marker([coords[0], coords[1]]).addTo(map).on('click',function(){
		generateCrimeData(marker.myId,coords);
	});
	
	marker.myId = crimeID;
}


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
				//console.log(id);
				if(id == crimeID){
					console.log(crimeID);
					var address = response[n].Address;
					var agency = response[n].Agency;
					var type = response[n].CrimeType;
					var time = response[n].DateTime;
					var description = response[n].Description;
					
					var string = '<h1>'+address+'</h1>';
					string += '<h2>'+agency+'</h2>';
					string += '<p>'+description+'</p>';
					string += '<img src="http://maps.googleapis.com/maps/api/streetview?size=400x200&location='+this.streetCoords[0]+','+this.streetCoords[1]+'&fov=90&heading=235&pitch=10&sensor=false" />';
					
					sidebar.setContent(string);
					break;
					
				}else{
					
				}
			}
		},
		type: "GET"
		});
	
	sidebar.toggle();
}


function plotNeighborhoods(){
	var shpfile = new L.Shapefile('Neighborhoods.zip',{onEachFeature:function(feature, layer) {
    	
	}});
         shpfile.addTo(map);
}

function getlatlong(response){
	var coords = [];
	var myLat = response.results[0].geometry.location.lat;
	coords.push(myLat);
	var myLng = response.results[0].geometry.location.lng;
	coords.push(myLng);
	
	return coords;	
}


    
