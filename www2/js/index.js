
// Mouse over 
var highlightLayer;
function highlightFeature(e) {
    highlightLayer = e.target;
    highlightLayer.openPopup();
}

// Set up the map
var map = L.map('map', {
    zoomControl:true, maxZoom:28, minZoom:1
})

// Add map view data to URL
var hash = new L.Hash(map);

// Add attribution to the map
map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; \
                                  <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; \
                                  <a href="https://qgis.org">QGIS</a>');

// Set up Autolinker to truncate hyperlinks to 30 characters
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});



// Add the measure control
var measureControl = new L.Control.Measure({
    position: 'topleft',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'hectares'
});
measureControl.addTo(map);
document.getElementsByClassName('leaflet-control-measure-toggle')[0]
.innerHTML = '';
document.getElementsByClassName('leaflet-control-measure-toggle')[0]
.className += ' fas fa-ruler';

// Fit the map view to layer contents
var bounds_group = new L.featureGroup([]);
function setBounds() {
    if (bounds_group.getLayers().length) {
        map.fitBounds(bounds_group.getBounds());
    }
}





// Add map base layers

// Add the OpenStreetMap tiles to the map
map.createPane('pane_OpenStreetMap_0');
map.getPane('pane_OpenStreetMap_0').style.zIndex = 400;
var layer_OpenStreetMap_0 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    pane: 'pane_OpenStreetMap_0',
    opacity: 1.0,
    attribution: '',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});

// Add the CartodbDark tiles to the map
map.createPane('pane_CartodbDark_0');
map.getPane('pane_CartodbDark_0').style.zIndex = 400;
var layer_CartodbDark_0 = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    pane: 'pane_CartodbDark_0',
    opacity: 1.0,
    attribution: '',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});


// Add the Esri_WorldImagery tiles to the map
map.createPane('pane_Esri_WorldImagery');
map.getPane('pane_Esri_WorldImagery').style.zIndex = 400;
var layer_Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    pane: 'pane_Esri_WorldImagery',
    opacity: 0.5,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});


var defaultBaseLayer = layer_Esri_WorldImagery
map.addLayer(defaultBaseLayer);





// Add the quiet routes
function style_segment_quiet_routes_1_0(feature) {
    return {
        pane: 'pane_segment_quiet_routes_1',
        weight: 3,
        opacity: 0.1,
        color: 'magenta',
        dashArray: '',
        interactive: false,
    }
}
map.createPane('pane_segment_quiet_routes_1');
map.getPane('pane_segment_quiet_routes_1').style.zIndex = 401;
map.getPane('pane_segment_quiet_routes_1').style['mix-blend-mode'] = 'normal';

lyrQuietRoutes = new L.geoJson(json_segment_quiet_routes, {
    attribution: 'PCT',
    interactive: true,
    dataVar: 'json_segment_quiet_routes',
    layerName: 'Quiet routes',
    pane: 'pane_segment_quiet_routes_1',
    //onEachFeature: pop_segment_quiet_routes_1,
    
    style: style_segment_quiet_routes_1_0, // error: feature is not defined?
    //style: function(feature) {return style_segment_quiet_routes_1_0(feature)},

    filter: function(feature, layer) {
        // filter out everything so that the layer shows in the layer control 
        // but routes only show when hovering on a segment
        return false; 
    }
});
map.addLayer(lyrQuietRoutes)

// Style the 'Fast Routes' data

function style_segment_fast_routes_2_0(feature) {
    routeID = feature.properties.id
    return {
        pane: 'pane_segment_fast_routes_2',
        weight: 2,
        opacity: 0.2,
        color: 'cyan',
        dashArray: '',
        interactive: false,
    }
}
map.createPane('pane_segment_fast_routes_2');
map.getPane('pane_segment_fast_routes_2').style.zIndex = 402;
map.getPane('pane_segment_fast_routes_2').style['mix-blend-mode'] = 'normal';
lyrFastRoutes = new L.geoJson(json_segment_quiet_routes, {
    attribution: 'PCT',
    interactive: true,
    dataVar: 'json_segment_quiet_routes',
    layerName: 'Fast routes',
    pane: 'pane_segment_fast_routes_2',
    
    
    style: style_segment_fast_routes_2_0, 
    filter: function(feature, layer) {
        // filter out everything so that the layer shows in the layer control 
        // but routes only show when hovering on a segment
        return false; 
    }
});
map.addLayer(lyrFastRoutes)

// Add the Network Segments
var lyrQuietRoutes

// Get an array of ID strings for the routes that pass through the segment
function getSegmentRoutes(segmentID, lkpSegmentRoutes) {  
    // Filter the route ID lookup table by the segmentID
    var arrSegmentRoutes = lkpSegmentRoutes.filter(function(item){
            return item.segment == segmentID
    });

    // Add the route IDs for the segment to an array and return it
    var arrSegmentRouteIDs = [];
    arrSegmentRoutes.forEach(route => {
        var routeID = route["route"]
        arrSegmentRouteIDs.push(routeID)
    });
    
    return arrSegmentRouteIDs;
}

var showQuietRoutes = false
var highlightSegment;
function showSegmentRoutes(e) {
    // Remove the existing fast & quiet routes
    map.removeLayer(lyrQuietRoutes)
    map.removeLayer(lyrFastRoutes)

    highlightSegment = e.target;
    var segmentID = highlightSegment.feature.properties.local_id;

    // lkpSegmentRoutes loaded from lkp_segment_fast_routes.js in index.html
    var segmentRoutes = getSegmentRoutes(segmentID, lkpSegmentRoutes);

    lyrQuietRoutes = new L.geoJson(json_segment_quiet_routes, {
        attribution: 'PCT',
        interactive: true,
        dataVar: 'json_segment_quiet_routes',
        layerName: 'Quiet routes',
        pane: 'pane_segment_quiet_routes_1',
        //onEachFeature: pop_segment_quiet_routes_1,
        
        style: style_segment_quiet_routes_1_0, // error: feature is not defined?
        //style: function(feature) {return style_segment_quiet_routes_1_0(feature)},

        filter: function(feature, layer) {
            var filter = false
            if (showQuietRoutes) {
                filter = segmentRoutes.includes(feature.properties.id);
            }
            return filter;
        }
    });
    map.addLayer(lyrQuietRoutes)

    lyrFastRoutes = new L.geoJson(json_segment_quiet_routes, {
        attribution: 'PCT',
        interactive: true,
        dataVar: 'json_segment_quiet_routes',
        layerName: 'Fast routes',
        pane: 'pane_segment_fast_routes_2',
        
        
        style: style_segment_fast_routes_2_0, 
        filter: function(feature, layer) {
            return segmentRoutes.includes(feature.properties.id);
        }
    });
    map.addLayer(lyrFastRoutes)
    // bounds_group.addLayer(layer_segment_quiet_routes_1);
}






// Set up the colours for the network segments
var brewSegment = new classyBrew();

// add a new colour pallete
brewSegment.colorSchemes['RdOr']={
    3: ['rgb(254,232,200)', 'rgb(253,187,132)', 'rgb(227,74,51)'], 
    4: ['rgb(254,240,217)', 'rgb(253,204,138)', 'rgb(252,141,89)', 'rgb(215,48,31)'], 
    5: ['rgb(179,0,0)', 'rgb(227,74,51)', 'rgb(252,141,89)', 'rgb(253,204,138)','rgb(254,240,217)'], 
    6: ['rgb(254,240,217)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(227,74,51)', 'rgb(179,0,0)'], 
    7: ['rgb(254,240,217)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(153,0,0)'], 
    8: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(153,0,0)'], 
    9: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(179,0,0)', 'rgb(127,0,0)'], 
    'properties':{'type': 'seq','blind':[1],'print':[1,1,0,0,0,0,0],'copy':[1,1,2,0,0,0,0],'screen':[1,1,1,0,0,0,0] } }

var segmentProperty = 'govtarget_slc';

// pass values from your geojson object into an empty array
// see link above to view geojson used in this example
var segmentValues = [];
for (var i = 0; i < json_lsoa_network.features.length; i++){
    if (json_lsoa_network.features[i].properties[segmentProperty] == null) continue;
    segmentValues.push(json_lsoa_network.features[i].properties[segmentProperty]);
}

brewSegment.setSeries(segmentValues);

var segmentClasses = 5
var segmentColorCode = "RdOr"
var segmentClassify = "equal_interval"

brewSegment.setNumClasses(segmentClasses);
 
brewSegment.setColorCode(segmentColorCode);

// classify by passing in statistical method
// i.e. equal_interval, jenks, quantile
brewSegment.classify(segmentClassify);

var segmentColours = brewSegment.getColors();
var segmentBreaks = brewSegment.getBreaks();
console.log('segment colours: ', segmentColours)
console.log('segment breaks: ', segmentBreaks)

var segmentLegend = [];
for (var i = 0; i < segmentClasses; i++){
    var strBreakMin = segmentBreaks[i]
    var strBreakMax = segmentBreaks[i+1]
    var legendItem = {
        label: "".concat(strBreakMin.toFixed(0), " <h1>to</h1> ", strBreakMax.toFixed(0)),
        type: "polyline",
        color: segmentColours[i],
        fillColor: segmentColours[i],
        weight: 2
    }
    segmentLegend.push(legendItem)
} 

function highlightSegment(e) {
    var layer = e.target;
    layer_lsoa_network_3.setStyle({
        opacity: 0.2
    });
    layer.setStyle({
        opacity: 1
    });



    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    layer_lsoa_network_3.resetStyle(e.target);
}

function pop_lsoa_network_3(feature, layer) {
    layer.on({
        /*
        mouseout: function(e) {
            map.removeLayer(lyrQuietRoutes)
            map.removeLayer(lyrFastRoutes)
            resetHighlight
        },
        mouseover: function(e) {
            showSegmentRoutes
            highlight
        },
        */
        mouseout: resetHighlight,
        mouseover: highlightSegment
    });
    var popupContent = `
    <h1>PCT Network Segment ID: ${feature.properties['local_id']}</h1>
    This network link is ${feature.properties['pctLinkLength'] != null ? feature.properties['pctLinkLength'].toFixed(0) : '?'}m long, and in the 2011 census was used by ${feature.properties['bicycle'].toFixed(0)} cycle commuters.<br> 
    The highway links downloaded from Ordnance Survey cover ${feature.properties['osLinkCoverage'] != null ? (feature.properties['osLinkCoverage']*100).toFixed(2) : 0}% of the pct network segment, and suggests:<br>
    <ul>
        <li> Average road width of ${feature.properties['osRoadWidthAverage'] != null ? feature.properties['osRoadWidthAverage'].toFixed(2) : '?'}m</li>
        <li> Minimum road width of ${feature.properties['osRoadWidthMinimum'] != null ? feature.properties['osRoadWidthMinimum'].toFixed(2) : '?'}m</li>
        <li> Average gradient of ${feature.properties['osGradientAverage'] != null ? feature.properties['osGradientAverage'].toFixed(2) : '?'} in 1</li>
        <li> Maximum gradient of ${feature.properties['osGradientMax'] != null ? feature.properties['osGradientMax'].toFixed(2) : '?'} in 1</li>
    </ul>
    The table below shows the increase in cycle uptake that the PCT model estimates would be required to meet the various scenario levels: <br>
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th scope="col">Scenario</th>
                <th scope="col">Commuters</th>
                <th scope="col">Increase</th>
            </tr>
        </thead>
        <tbody>
        <tr>
            <th scope="row">Government Target (equality)</th>
            <td>${feature.properties['govtarget_slc'].toFixed(0)}</td>
            <td>${feature.properties['govtarget_sic'].toFixed(0)}</td>
        </tr>
        <tr>
            <th scope="row">Government Target (near market)</th>
            <td>${feature.properties['govnearmkt_slc'].toFixed(0)}</td>
            <td>${feature.properties['govnearmkt_sic'].toFixed(0)}</td>
        </tr>
        <tr>
            <th scope="row">Gender equality</th>
            <td>${feature.properties['gendereq_slc'].toFixed(0)}</td>
            <td>${feature.properties['gendereq_sic'].toFixed(0)}</td>
        </tr>
        <tr>
            <th scope="row">Go Dutch</th>
            <td>${feature.properties['dutch_slc'].toFixed(0)}</td>
            <td>${feature.properties['dutch_sic'].toFixed(0)}</td>
        </tr>
        <tr>
            <th scope="row">Ebikes</th>
            <td>${feature.properties['ebike_slc'].toFixed(0)}</td>
            <td>${feature.properties['ebike_sic'].toFixed(0)}</td>
        </tr>
    </table>`
    layer.bindPopup(popupContent, {maxHeight: 400});
}

function style_lsoa_network_3_0(feature) {

    return {
        pane: 'pane_lsoa_network_3',
        opacity: 0.75,
        color: brewSegment.getColorInRange(feature.properties[segmentProperty]), // Use ColorBrewer plugin to determine segment colour
        dashArray: '',
        lineCap: 'square',
        lineJoin: 'bevel',
        weight: 2.0,
        fillOpacity: 0,
        interactive: true,}
    
}
map.createPane('pane_lsoa_network_3');
map.getPane('pane_lsoa_network_3').style.zIndex = 403;
map.getPane('pane_lsoa_network_3').style['mix-blend-mode'] = 'normal';
var layer_lsoa_network_3 = new L.geoJson(json_lsoa_network, {
    attribution: '',
    interactive: true,
    dataVar: 'json_lsoa_network',
    layerName: 'layer_lsoa_network_3',
    pane: 'pane_lsoa_network_3',
    onEachFeature: pop_lsoa_network_3,
    style: style_lsoa_network_3_0,
});
bounds_group.addLayer(layer_lsoa_network_3);
map.addLayer(layer_lsoa_network_3);


var baseMaps = {"OpenStreetMap": layer_OpenStreetMap_0,
                "CartoDB Dark Matter": layer_CartodbDark_0,
                "Esri World Imagery": layer_Esri_WorldImagery};
var overlays = {};
/*
var overlays = {'lsoa_network<br /> \
                    <table><tr><td style="text-align: center;"><img src="legend/lsoa_network_3_0250.png" /></td><td>0 - 25</td></tr> \
                        <tr><td style="text-align: center;"><img src="legend/lsoa_network_3_25651.png" /></td><td>25 - 65</td></tr> \
                        <tr><td style="text-align: center;"><img src="legend/lsoa_network_3_651262.png" /></td><td>65 - 126</td></tr> \
                        <tr><td style="text-align: center;"><img src="legend/lsoa_network_3_1262223.png" /></td><td>126 - 222</td></tr> \
                        <tr><td style="text-align: center;"><img src="legend/lsoa_network_3_2225954.png" /></td><td>222 - 595</td></tr> \
                    </table>': layer_lsoa_network_3, // The breaks for the network section colors are hard coded, needs a colour mapper
                '<img src="legend/segment_fast_routes_2.png" /> Fast routes': lyrFastRoutes,
                '<img src="legend/segment_quiet_routes_1.png" /> Quiet routes': lyrQuietRoutes,
            }
*/
var layerControlSettings = {"autoZIndex": true, "collapsed": true, "position": "topright"}

L.control.layers(baseMaps, overlays, layerControlSettings).addTo(map);

// Add the map legend
const legend = L.control.Legend({
    position: "bottomleft",
    collapsed: false,
    symbolWidth: 25,
    opacity: 1,
    column: 1,
    legends: segmentLegend,
})
.addTo(map);

setBounds();



// Sort out the table
$('#tbl-segments').DataTable( {
    data: json_lsoa_network.features,
    columnDefs: [
        { render: function ( data, type, row ) {
                var value
                if (data == null) {
                    value = ""
                }
                else {
                    value = data.toFixed(2);
                 }
                 return value},
            targets: [2,3,4,5,6,7] }
    ],
    columns: [
        { data: 'properties.bicycle', title: 'Census' },
        { data: 'properties.' + segmentProperty, title: segmentProperty},

        { data: 'properties.pctLinkLength', title: 'Link length'},
        { data: 'properties.osRoadWidthAverage', title: 'Ave. road width'},
        { data: 'properties.osRoadWidthMinimum', title: 'Min. road width'},
        { data: 'properties.osGradientAverage', title: 'Ave. gradient'},
        { data: 'properties.osGradientMax', title: 'Max. gradient'},
    ]
} );