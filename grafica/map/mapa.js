const UPZ_LOCAL_PATH ='upz.json'
mapboxgl.accessToken='pk.eyJ1IjoibHVpc3JvamFzIiwiYSI6ImNrOGwwbThkbDA3cDYzbG13cng5bmNoZmgifQ.F5JOCuNsxevPLFsPbsoV6g';

var map;
var upzPolygon;
var upzJSON;
var chpColorsMap = ['match', ['get', 'OBJECTID']];

var hoveredStateId = null;

function loadMap(){

    return new Promise(function(resolve, reject){

    map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center:[-74.081749,4.6097102],
            zoom: 12,
            pitch: 60
    });
    resolve();
    map.on('load',function(){
        map.addSource('UPZ',{'type': 'geojson', 'data': upzJSON});
        map.addLayer({
            'id': 'UPZPolygons',
            'type': 'fill',
            'source': 'UPZ',
            'layout': {'visibility': 'visible'},
            'paint': {
                'fill-color': 'hsla(145, 0, 0.7, 1)', //colores #000000 , rgb, rgba, hsl, hsla
                'fill-outline-color': 'hsla(0, 0, 0, 1)',
                'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.5]
            }
        });
        choroplethMap();
        map.addLayer({
            'id': '3d-buildings', 
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#ccc',
                'fill-extrusion-height':  ['get', 'height']
            }
        });
        
        map.addSource("markers",{'type': 'geojson', 'data': UPZ_center_points_incidents});
        
        map.addLayer({
        'id': 'names',
        "type": "symbol", 
        "source": "markers", 
        "layout": {
            'text-field': [
            'format',
            ['upcase',['get','upz_name']],
            {'font-scale':0.8},
        ],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset':[0,0.6],
        'text-anchor':'top'
        }
    });

    });
   
    map.on('mouseleave', 'UPZPolygons', function(){

         map.getCanvas().style.cursor = '';
         if (hoveredStateId){
             map.setFeatureState({
                 source: 'UPZ',
                 id: hoveredStateId
             },
             {hover: false});
         }
         
            hoveredStateId = null;

    });

    map.on('mousemove', 'UPZPolygons', function(e){

        if(e.features.length > 0){

            if(hoveredStateId){
                map.setFeatureState({
                    source: 'UPZ',
                    id: hoveredStateId
                },
                {
                    hover: false
                });
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState({source: 'UPZ',
                                id: hoveredStateId},
                                {hover: true});
        }
    });


    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
        });

    map.on('mouseenter', 'names', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
            
        var coordinates = e.features[0].geometry.coordinates.slice();
        var cod_upz = e.features[0].properties.COD_UPZ;
        var idf = e.features[0].id;
        var incidents = e.features[0].properties.incidents;

        popup
        .setLngLat(coordinates)
        .setHTML('<br> COD_UPZ: ' + cod_upz + '<br> ID: ' + idf + '<br> Incidents: ' + incidents)
        .addTo(map);
        });
    
    map.on('mouseleave', 'names', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
        });

    });
    
}

function choroplethMap(){
    
    var listIncidents = [];
    
    UPZ_center_points_incidents.features.forEach(function(item){
        listIncidents.push(item.properties.incidents);
    });
    
    var quantiles = chroma.limits(listIncidents, 'e', 4);
    var colorScale = chroma.scale(['#FF1B00', '#FFA14E']).mode('lch').colors(5);

    UPZ_center_points_incidents.features.forEach(function(item){

        var color = '#FF1B00';

        for (var i = 0; i < quantiles.length; i++){

            if (item.properties.incidents <= quantiles[i]){

                color = colorScale[i];
                chpColorsMap.push(item.properties.OBJECTID, color);
                break;
                
            }

        }

    });
    chpColorsMap.push('rgba(0,0,0,0)');   
    map.addLayer({
        'id': 'choropleth map',
        'type': 'fill',
        'source': 'UPZ',
        'Layout': {'visibility': 'visible'},
        'paint': {
            'fill-color': chpColorsMap,
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.7, 0.5]
        }
    });
}

function loadJSONFile(urlData){
    
    return new Promise(function(resolve, reject){
    
    var xhrData = new XMLHttpRequest();
   
    xhrData.overrideMimeType('application/json');
    xhrData.open('GET',urlData, true);
   
    xhrData.onload = function(content){
        if (xhrData.readyState == 4 && xhrData.status == 200){
            upzPolygon = xhrData.responseText;

            console.log("archivo leido");
            resolve(content);
        }else{
            var message = "No se pudo leer";
            reject(message);
        }
    }
    xhrData.send();
    });
}

function parseJSONFile(data){
    
    return new Promise(function(resolve, reject){
        if (data.length > 0){
            upzJSON = JSON.parse(data);
            resolve();
        }else{
            var message = "No se pudo hacer el parseo";
            reject(message);
        }
    });
}

function init(){
    loadJSONFile(UPZ_LOCAL_PATH)
    .then(content => loadMap())
    .then(content => parseJSONFile(upzPolygon))
    .catch(err => console.log('Valide el siguiente error: '+err));
}

init();
