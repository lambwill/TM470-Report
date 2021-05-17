
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

var defaultBaseLayer = layer_CartodbDark_0
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

lyrQuietRoutes = new L.geoJson(json_segment_quiet_routes_1, {
    attribution: 'PCT',
    interactive: true,
    dataVar: 'json_segment_quiet_routes_1',
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

function style_segment_fast_routes_2_0() {
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
lyrFastRoutes = new L.geoJson(json_segment_fast_routes_2, {
    attribution: 'PCT',
    interactive: true,
    dataVar: 'json_segment_fast_routes_2',
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

    lyrQuietRoutes = new L.geoJson(json_segment_quiet_routes_1, {
        attribution: 'PCT',
        interactive: true,
        dataVar: 'json_segment_quiet_routes_1',
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

    lyrFastRoutes = new L.geoJson(json_segment_fast_routes_2, {
        attribution: 'PCT',
        interactive: true,
        dataVar: 'json_segment_fast_routes_2',
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
for (var i = 0; i < json_lsoa_network_3.features.length; i++){
    if (json_lsoa_network_3.features[i].properties[segmentProperty] == null) continue;
    segmentValues.push(json_lsoa_network_3.features[i].properties[segmentProperty]);
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
        label: "".concat(strBreakMin, " < ", segmentProperty, " < ", strBreakMax),
        type: "polyline",
        color: segmentColours[i],
        fillColor: segmentColours[i],
        weight: 2
    }
    segmentLegend.push(legendItem)
} 




function pop_lsoa_network_3(feature, layer) {
    layer.on({
        mouseout: function(e) {
            map.removeLayer(lyrQuietRoutes)
            map.removeLayer(lyrFastRoutes)
        },
        mouseover: showSegmentRoutes,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2"><strong>local_id</strong><br />' + (feature.properties['local_id'] !== null ? autolinker.link(feature.properties['local_id'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">bicycle</th>\
                <td>' + (feature.properties['bicycle'] !== null ? autolinker.link(feature.properties['bicycle'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">govtarget_slc</th>\
                <td>' + (feature.properties['govtarget_slc'] !== null ? autolinker.link(feature.properties['govtarget_slc'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">govnearmkt_slc</th>\
                <td>' + (feature.properties['govnearmkt_slc'] !== null ? autolinker.link(feature.properties['govnearmkt_slc'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">gendereq_slc</th>\
                <td>' + (feature.properties['gendereq_slc'] !== null ? autolinker.link(feature.properties['gendereq_slc'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">dutch_slc</th>\
                <td>' + (feature.properties['dutch_slc'] !== null ? autolinker.link(feature.properties['dutch_slc'].toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <th scope="row">ebike_slc</th>\
                <td>' + (feature.properties['ebike_slc'] !== null ? autolinker.link(feature.properties['ebike_slc'].toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    layer.bindPopup(popupContent, {maxHeight: 400});
}

function style_lsoa_network_3_0(feature) {

    return {
        pane: 'pane_lsoa_network_3',
        opacity: 1,
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
var layer_lsoa_network_3 = new L.geoJson(json_lsoa_network_3, {
    attribution: '',
    interactive: true,
    dataVar: 'json_lsoa_network_3',
    layerName: 'layer_lsoa_network_3',
    pane: 'pane_lsoa_network_3',
    onEachFeature: pop_lsoa_network_3,
    style: style_lsoa_network_3_0,
});
bounds_group.addLayer(layer_lsoa_network_3);
map.addLayer(layer_lsoa_network_3);


var baseMaps = {"OpenStreetMap": layer_OpenStreetMap_0,
                "CartoDB Dark Matter": layer_CartodbDark_0};
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
    symbolWidth: 24,
    opacity: 1,
    column: 2,
    legends: segmentLegend,
})
.addTo(map);






setBounds();