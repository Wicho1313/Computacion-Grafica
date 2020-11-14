function polygonVisible (){
    document.getElementById('state-legend').style.display = 'none';
    map.getSource('markers').setData(poblacion);

    map.setLayoutProperty('UPZPolygons','visibility','visible');
    map.setLayoutProperty('choro','visibility','none');
    map.setLayoutProperty('heat','visibility','none');
    
}

function heatmapVisible (mes, data){
    
    document.getElementById('state-legend').style.display = 'none';
    
    var x = map.getPaintProperty('heat','heatmap-weight');
    var y = map.getPaintProperty('points','circle-radius');
    var z = map.getPaintProperty('points','circle-color');
    map.getSource('muni').setData(data);

        if(x[2][1] === mes){
            map.setLayoutProperty('heat','visibility','visible');
            map.setLayoutProperty('choro','visibility','none');
            map.setLayoutProperty('UPZPolygons','visibility','none');
            map.getSource('markers').setData(poblacion);

        }else{
            x[2][1] = mes;
            map.setPaintProperty('heat', 'heatmap-weight', x);
            y[4][2][1] = mes;
            map.setPaintProperty('points', 'circle-radius', y);
            y[6][2][1] = mes;
            map.setPaintProperty('points', 'circle-radius', y);
            z[2][1] = mes;
            map.setPaintProperty('points', 'circle-color', z);

            map.setLayoutProperty('heat','visibility','visible');
            map.setLayoutProperty('choro','visibility','none');
            map.setLayoutProperty('UPZPolygons','visibility','none');
            map.getSource('markers').setData(poblacion);

        }
}

function choroplethVisible (mes,data){
    
    document.getElementById('state-legend').style.display = 'block';
    document.getElementById('titulo').innerHTML = mes;
    map.removeLayer('choro');
    
    var chpColorsMap = ['match', ['get', 'state_code']];
    map.setLayoutProperty('heat','visibility','none');
    map.setLayoutProperty('UPZPolygons','visibility','visible');

    map.getSource('markers').setData(data);

    var list = [];

    data["features"].forEach(function(item){
        list.push(item["properties"][mes]);
    });

    var quantiles = chroma.limits(list, 'q', 4);
    var colorScale = chroma.scale(['#ffff00', '#ff0000']).mode('lch').colors(5);

    document.getElementById('s0nivel').style.backgroundColor = colorScale[0];
    document.getElementById('b0nivel').innerHTML = '0 - ' + quantiles[0];

    document.getElementById('s1nivel').style.backgroundColor = colorScale[1];
    document.getElementById('b1nivel').innerHTML = quantiles[0] + ' - ' + quantiles[1];

    document.getElementById('s2nivel').style.backgroundColor = colorScale[2];
    document.getElementById('b2nivel').innerHTML = quantiles[1] + ' - ' + quantiles[2];

    document.getElementById('s3nivel').style.backgroundColor = colorScale[3];
    document.getElementById('b3nivel').innerHTML = quantiles[2] + ' - ' + quantiles[3];

    document.getElementById('s4nivel').style.backgroundColor = colorScale[4];
    document.getElementById('b4nivel').innerHTML = quantiles[3] + ' - ' + quantiles[4];
    
    data["features"].forEach(function(item){
    
        var color = colorScale[0];

        for (var i = 0; i < quantiles.length; i++){

            if (item["properties"][mes] <= quantiles[i]){

                color = colorScale[i];
                chpColorsMap.push(item["properties"]["OBJECTID"], color);
                break;
                
            }
            
        }

    });
    chpColorsMap.push('rgba(0,0,0,0)');   

    map.addLayer({
        'id': 'choro',
        'type': 'fill',
        'source': 'UPZ',
        'Layout': {'visibility': 'none'},
        'paint': {
            'fill-color': chpColorsMap,
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.7, 0.5]
        }
    });
      
}
$(document).ready(function(){
    $('.dropdown-submenu a.test').on("click", function(e){
      $(this).next('ul').toggle();
      e.stopPropagation();
      e.preventDefault();
    });
  });