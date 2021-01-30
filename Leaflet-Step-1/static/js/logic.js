// Store weekly eartquake API URL to the varibale URL.
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(url, function(response){
    var response_data = response.features
    // console.log(response_data)
    createfeature(response_data);
}); 

// Create Function that will use response data for each feature in the features array
createfeature=(response_data) => {
  // From each Feature in feature array a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes_data = L.geoJSON(response_data, {
                        pointToLayer:(feature, latlng) => {
                         return new L.Circle(latlng, {
                          radius: feature.properties.mag * 20000,
                          color: getcolor(feature.geometry.coordinates[2]),
                          weight: 1,
                          opacity: 1,
                          fillOpacity: 0.5
                         });   
                        },
    onEachFeature: onEachFeature
  });  
  createmap(earthquakes_data);
};

// Function that will take in `earthquake data` as an argument.
// This function will create both the tile layer, overlay layer, legend info. 
function createmap(earthquakes_data) {

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes_data
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [lightmap, earthquakes_data]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  // color function to be used when creating the legend
  function getColor(d) {
    // return d > 50  ? '#CC0000':
    return d > 50   ? "#FF6666": 
           d > 40   ? "#FF8000":
           d > 30   ? "#FFB266":
           d > 20   ? "#FFFF00":
           d > 10   ? "#80FF00":
                      "#B2FF66";
  };

  // Create a legend to display information about our map
  var legendinfo = L.control({position: "bottomright"});
  // console.log(info);
  // When the layer control is added, insert a div with the class of "info legend"
  legendinfo.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");
        depths = [0,10,20,30,40,50];
        labels = []; 

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depths.length; i++) {
      // console.log(depths[i])
      div.innerHTML += 
       labels.push(
          '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+')
      )
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };
  // Add the info legend to the map
  legendinfo.addTo(myMap);
};

// Function will add colour to the map based on the depth
getcolor=(depth) => {
  if (depth < 00) {
    return "#B2FF66";
  };
  if (depth < 10) {
    return "#80FF00"
  };
  if (depth < 20) {
    return "#FFFF00";
  };
  if (depth < 30) {
    return "#FFB266";
  };
  if (depth < 40) {
    return "#FF8000";
  };
  if (depth < 50) {
    return "#FF6666";  
  }
  else {
    return "#CC0000";
  }; 
};