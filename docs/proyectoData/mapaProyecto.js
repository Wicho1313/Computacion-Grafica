const UPZ_LOCAL_PATH ='test.json'
mapboxgl.accessToken='pk.eyJ1IjoibHVpc3JvamFzIiwiYSI6ImNrOGwwbThkbDA3cDYzbG13cng5bmNoZmgifQ.F5JOCuNsxevPLFsPbsoV6g';

var map;
var upzPolygon;
var upzJSON;
var hoveredStateId = null;


function loadMap(){

  return new Promise(function(resolve, reject){

  map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/dark-v10',
          center: [-99.64476, 19.355846],
          zoom: 5,
          pitch: 40
  });

  resolve();
  
  map.on('load',function(){
      map.addSource('UPZ',{'type': 'geojson', 'data': upzJSON});
      map.addSource("markers",{'type': 'geojson', 'data': poblacion});
      map.addSource("muni",{'type': 'geojson', 'data': mun_confirmed});

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
      
      map.addLayer({
          'id': '3d-buildings', 
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 5,
          'paint': {
              'fill-extrusion-color': '#ccc',
              'fill-extrusion-height':  ['get', 'height']
          }
      });
      
      map.addLayer({
      'id': 'names',
      "type": "symbol", 
      "source": "markers", 
      "layout": {
          'text-field': [
          'format',
          ['upcase',['get','estado']],
          {'font-scale':0.8},
        ],
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset':[0,0.6],
      'text-anchor':'top'
      }
    });
      
    
    heatmap(); 
  
  });

  map.on('click', 'points', function(e) {
          
    var y = map.getPaintProperty('points','circle-radius');
    var z = map.getPaintProperty('points','circle-color');

    if (y[4][2][1] === 'Marzo' && y[6][2][1] === 'Marzo' && z[2][1] === 'Marzo'){
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Municipio: '+ e.features[0].properties.municipio +
                '<br>Casos totales en Marzo: ' + e.features[0].properties.Marzo)
        .addTo(map);
    }
    else if (y[4][2][1] === 'Abril' && y[6][2][1] === 'Abril' && z[2][1] === 'Abril'){
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Municipio: '+ e.features[0].properties.municipio +
                '<br>Casos totales en Abril: ' + e.features[0].properties.Abril)
        .addTo(map);
    }
    else{
      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Municipio: '+ e.features[0].properties.municipio +
                '<br>Casos totales en Mayo: ' + e.features[0].properties.Mayo)
        .addTo(map);
    }
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

      if (map.getSource('markers')["_data"] === nac_conf){

        document.getElementById('titulo2').innerText = 'Confirmados';
               
        popup
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Estado: '+ e.features[0].properties.estado +
                '<br>Casos confirmados en Marzo: ' + e.features[0].properties.Marzo +
                '<br>Casos confirmados en Abril: ' + e.features[0].properties.Abril +
                '<br>Casos confirmados en Mayo: ' + e.features[0].properties.Mayo)
        .addTo(map);
      }
      else if(map.getSource('markers')["_data"] === nac_defun){

        document.getElementById('titulo2').innerHTML = 'Defunciones';
  
        popup
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Estado: '+ e.features[0].properties.estado +
                '<br>Defunciones en Marzo: ' + e.features[0].properties.Marzo +
                '<br>Defunciones en Abril: ' + e.features[0].properties.Abril +
                '<br>Defunciones en Mayo: ' + e.features[0].properties.Mayo)
        .addTo(map);
  
      }else if(map.getSource('markers')["_data"] === nac_neg){
  
        document.getElementById('titulo2').innerHTML = 'Negativos';
        
        popup
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Estado: '+ e.features[0].properties.estado +
                '<br>Casos negativos en Marzo: ' + e.features[0].properties.Marzo +
                '<br>Casos negativos en Abril: ' + e.features[0].properties.Abril +
                '<br>Casos negativos en Mayo: ' + e.features[0].properties.Mayo)
        .addTo(map);
  
      }else if(map.getSource('markers')["_data"] === nac_sos){
        
        document.getElementById('titulo2').innerHTML = 'Sospechosos';

        popup
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br>Estado: '+ e.features[0].properties.estado +
                '<br>Sospechosos en Marzo: ' + e.features[0].properties.Marzo +
                '<br>Sospechosos en Abril: ' + e.features[0].properties.Abril +
                '<br>Sospechosos en Mayo: ' + e.features[0].properties.Mayo)
        .addTo(map);
  
      }
      else {
        
        popup
        .setLngLat(e.features[0].geometry.coordinates)
        .setHTML('<br> Estado: ' + e.features[0].properties.estado + 
                 '<br> Población: ' + e.features[0].properties.poblacion )
        .addTo(map);
      }
      
    });
  
  map.on('mouseleave', 'names', function() {
      map.getCanvas().style.cursor = '';
      popup.remove();
      });


  });

}

function heatmap (){
    //HEATMAP
    map.addLayer({
      'id': 'heat',
      'type': 'heatmap',
      'source': 'muni',
      "layout": {'visibility': "none"},
      'maxzoom': 15,
      'paint': {
        // increase weight as diameter breast height increases
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'Enero'],
          0,
          0,
          6,
          1           
        ],
        // increase intensity as zoom level increases
        'heatmap-intensity': {
          'stops': [
            [110, 10],
            [150, 30]
          ]
        },
        // assign color values be applied to points depending on their density
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        // increase radius as zoom increases
        'heatmap-radius': {
          'stops': [
            [9, 13],
            [13, 18]
          ]
        },
        // decrease opacity to transition into the circle layer
        'heatmap-opacity': {
          'default': 1,
          'stops': [
            [14, 1],
            [15, 0]
          ]
        },
      }
    }, 'waterway-label');
      
    map.addLayer({
      'id': 'points',
      'type': 'circle',
      'source': 'muni',
      'minzoom': 14,
      'paint': {
        // increase the radius of the circle as the zoom level and propertie value increases
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'], 7,
          ['interpolate', ['linear'], ['get', 'Enero'], 1, 1, 6, 4],16,
          ['interpolate', ['linear'], ['get', 'Enero'], 1, 5, 6, 50]
          ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'Enero'],
          1, 'rgba(33,102,172,0)',
          2, 'rgb(103,169,207)',
          3, 'rgb(209,229,240)',
          4, 'rgb(253,219,199)',
          5, 'rgb(239,138,98)',
          6, 'rgb(178,24,43)'
          ],
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': {
          'stops': [
            [14, 0],
            [15, 1]
          ]
        }
      }
    }, 'waterway-label');
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
