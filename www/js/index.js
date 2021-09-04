// Set up the map
var map = L.map('map',{
  zoomControl:false, maxZoom:28, minZoom:1
})

// Add map view data to URL
var hash = new L.Hash(map)

// Fit the map view to layer contents
var mapBoundsGroup = new L.featureGroup([])
function mapZoomAll() {
    if (mapBoundsGroup.getLayers().length) {
        map.fitBounds(mapBoundsGroup.getBounds())
    }
}

// details of the varios scenarios used in the PCT model
var pctScenarios = {
	govtarget : {
		description : "Doubling the number of cycle journeys at a national level. Local factors such as journey length and hilliness affect how much growth would be expected for any individual location. This scenario takes hilliness and journey distance into account alone.", 
		name : "Government Target (Equality)"},
	govnearmkt : {
		description : "The Near Market scenario builds on the Equality scenario by taking into account other local socio-economic factors including age, sex, ethnicity, car ownership, and income deprivation.", 
		name : "Government Target (Near Market)"},
	gendereq : {
		description : "This scenario represents the increase in cycling that would be expected if as many women were to cycle as men.", 
		name : "Gender equality"},
	dutch : {
		description : "The increase in cycling that would be expected if English people were as likely to cycle a given route as the Dutch would be to cycle a route of equal distance and hilliness in Holland.",
		name : "Go Dutch"},
	ebike : {
		description : "The increase in cycling that would be expected in the Go Dutch scenario if ebikes were widely adopted", 
		name : "Ebikes"},
	}

//////////////////////////////////////////////////////////////////////////////////////
// Add map base layers

// Add the OpenStreetMap tiles to the map
map.createPane('pane_OpenStreetMap');
map.getPane('pane_OpenStreetMap').style.zIndex = 400;
var layer_OpenStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    pane: 'pane_OpenStreetMap',
    opacity: 1.0,
    attribution: '© OpenStreetMap contributors',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});

// Add the CartodbDark tiles to the map
map.createPane('pane_CartodbDark');
map.getPane('pane_CartodbDark').style.zIndex = 400;
var layer_CartodbDark = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    pane: 'pane_CartodbDark',
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

// Set the default base layer and add it to the map
var defaultBaseLayer = layer_Esri_WorldImagery
map.addLayer(defaultBaseLayer);


//////////////////////////////////////////////////////////////////////////////////////
// Add the study boundary

map.createPane('pane_study_boundary');

// https://leafletjs.com/reference-1.7.1.html#map-pane
map.getPane('pane_study_boundary').style.zIndex = 501;

// https://www.w3schools.com/cssref/pr_mix-blend-mode.asp
map.getPane('pane_study_boundary').style['mix-blend-mode'] = 'normal'; 

lyrStudyBoundary = new L.geoJson(json_study_boundary, {
    attribution: 'Source: Office for National Statistics licensed under the Open Government Licence v.3.0',
    interactive: true,
    dataVar: 'json_study_boundary',
    layerName: 'Quiet routes',
    pane: 'pane_study_boundary',
    
    style: {
        pane: 'pane_study_boundary',
        stroke: true,
        opacity: 1,
        weight: 2,
        color: '#00008b', // Dark blue
        fill: false,
        dashArray: '5 5 1',
        interactive: false,
    },
});
map.addLayer(lyrStudyBoundary)
mapBoundsGroup.addLayer(lyrStudyBoundary);





//////////////////////////////////////////////////////////////////////////////////////
// 
var legend = L.control({position: 'bottomright'});
var pctDropdown = $("#pctDropdown").html()

legend.onAdd = function (map) {

    var divLegend = L.DomUtil.create('div', 'info legend')
    divLegend.id = 'legend'

    divLegend.innerHTML = '<div id="pctLegend"></div>'
    return divLegend;
};

legend.addTo(map);


//////////////////////////////////////////////////////////////////////////////////////
// add the highlight and click to zoom functions
function highlightFeature(e) {
    var layer = e.target;

    // set the style for the highlighted item
    layer.setStyle({
        weight: 7,
        color: '#ff0',
        dashArray: '',
        opacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

// reset the style after highlighting
function resetHighlight(e) {
    lyrPctNetwork.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}







///////////////////////////////////////////////////////
// Set up the colours for the network segments
var brewSegment = new classyBrew();

// // add a new colour pallete
// brewSegment.colorSchemes['RdOr']={}

// set up the suffixes for the absolute and difference PCT numbers
var pctChangeObj = {
    'absolute': '_slc',
    'difference': '_sic',
}

// set up the default PCT options
var pctProps ={
    segmentClasses: 5,
    pctScenario: 'govtarget',
    pctChange: 'absolute',
    segmentColorCode: 'PuRd',
    segmentClassify: 'equal_interval',
}
var lndPctNetwork
var lyrPctNetwork
var minPctOpacity = 0.1
var maxPctOpacity = 0.9








// function to classify and display the PCT network data
function updatePCTdisplay(pctProps) {
    if (lyrPctNetwork) {map.removeLayer(lyrPctNetwork)}
    //lndPctNetwork: lndPctNetwork

    // Set which attribute of the PCT network data is to be displayed, e.g. govtarget_slc
    var segmentProperty = pctProps.pctScenario + pctChangeObj[pctProps.pctChange];

    // Get a list of all of the PCT network data values for the chosen attribute (e.g. govtarget_slc)
    // and pass it to classyBrew
    var segmentValues = [];
    for (var i = 0; i < jsonPctNetwork.features.length; i++){
        if (jsonPctNetwork.features[i].properties[segmentProperty] == null) continue;
        segmentValues.push(jsonPctNetwork.features[i].properties[segmentProperty]);
    }
    brewSegment.setSeries(segmentValues);

    // Set the number of classes to classify
    // var segmentClasses = 5
    brewSegment.setNumClasses(pctProps.segmentClasses);

    // Set the colour map
    // var segmentColorCode = "OrRd"
    brewSegment.setColorCode(pctProps.segmentColorCode);

    // Classify by passing in statistical method (e.g. equal_interval, jenks, quantile)
    // var segmentClassify = "equal_interval"
    brewSegment.classify(pctProps.segmentClassify);
    var segmentColours = brewSegment.getColors();
    var segmentBreaks = brewSegment.getBreaks();

    // // function to set opacity based on breaks
    // function getPctOpacity(number) {
    //     var rangePctOpacity = maxPctOpacity - minPctOpacity
    //     var step = rangePctOpacity / pctProps.segmentClasses
    //     var i = 0
    //     var curBreak = segmentBreaks[i]
    //     var opacity = minPctOpacity
    //     while (number >= curBreak) {
    //         i = i++
    //         curBreak = segmentBreaks[i]
    //         opacity = opacity + step
    //     }
    //     return opacity
    // }

    function stylePctNetwork(feature) {
        var number
        if (feature) {
            number = feature.properties[segmentProperty]
            color = brewSegment.getColorInRange(number) // Use ColorBrewer plugin to determine segment colour
            breakColours = brewSegment.getColors()

            numBreak =  breakColours.indexOf(color) + 2
        }
        // var number = feature ? feature.properties[segmentProperty] : 0
        return {
            pane: 'panePctNetwork',
            opacity: 1-(1/numBreak),
            color: color, // brewSegment.getColorInRange(number), // Use ColorBrewer plugin to determine segment colour
            dashArray: '',
            lineCap: 'square',
            lineJoin: 'bevel',
            weight: 3.0,
            fill: false,
            interactive: true,}
        
    }
    map.createPane('panePctNetwork');
    map.getPane('panePctNetwork').style.zIndex = 501;
    map.getPane('panePctNetwork').style['mix-blend-mode'] = 'normal';
    lyrPctNetwork = new L.geoJson(jsonPctNetwork, {
        attribution: '',
        interactive: true,
        dataVar: 'jsonPctNetwork',
        layerName: 'lyrPctNetwork',
        pane: 'panePctNetwork',
        onEachFeature: onEachFeature,
        style: stylePctNetwork,
    });
    mapBoundsGroup.addLayer(lyrPctNetwork);
    map.addLayer(lyrPctNetwork);

    //////////////////////////////////////////////////////////////////////////////////////
    // add a legend for the PCT network data
    divPctLegend = $('#pctLegend')
    var pctHeaderText = pctScenarios[pctProps.pctScenario].name
    var pctHeader = $("<h3></h3>").text(pctHeaderText)
    pctHeader.id = 'pctHeader'
    divPctLegend.append(pctHeader)
    var divPctLegendItems = $("<div>");
    divPctLegendItems.addClass('p-3')
    for (var i = 0; i < pctProps.segmentClasses; i++){

        var divPCTLegendItem = $("<div>")

        // get the 
        var legendLine = $('#legendLine').children().clone()
        legendLine.find('line').attr({'stroke':segmentColours[i]})
        var strBreakMin = segmentBreaks[i]
        var strBreakMax = segmentBreaks[i+1]
        var label = "".concat(strBreakMin.toFixed(0), " - ", strBreakMax.toFixed(0))
        divPCTLegendItem.append(legendLine)
        divPCTLegendItem.append(label)

        divPctLegendItems.prepend(divPCTLegendItem)
    }
    $('#pctLegend').append(divPctLegendItems)
    $('#pctLegend').append(pctDropdown)

}




//////////////////////////////////////////////////////////////////////////////////////
// 

$("#govtarget").on("click", function(){
    pctProps.pctScenario = 'govtarget'
    updatePCTdisplay(pctProps)
})

$("#govnearmkt").on("click", function(){
    pctProps.pctScenario = 'govnearmkt'
    updatePCTdisplay(pctProps)
})

$("#gendereq").on("click", function(){
    pctProps.pctScenario = 'gendereq'
    updatePCTdisplay(pctProps)
})

$("#dutch").on("click", function(){
    pctProps.pctScenario = 'dutch'
    updatePCTdisplay(pctProps)
})

$("#ebike").on("click", function(){
    pctProps.pctScenario = 'ebike'
    updatePCTdisplay(pctProps)
})

$("#chkChange").on("change", function(){
    if ($('#chkChange').is(':checked')){
        pctProps.pctChange = 'absolute'
    }else{
        pctProps.pctChange = 'difference'
    }
    updatePCTdisplay(pctProps)
})


// classify and display the PCT network data using the default settings
updatePCTdisplay(pctProps)






/////////////////////////////////////////////////////////////////////////////////
// create the segment info box
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    var osDataHTML = ""
    if (props) {
    osDataHTML = props.osLinkCoverage ? 
        `This network link is` + props.pctLinkLength.toFixed(0) + `m long, and in the 2011 census was used by ` + props.bicycle.toFixed(0) + ` cycle commuters.<br> 
        The highway links downloaded from Ordnance Survey cover ` + (props.osLinkCoverage*100).toFixed(2) + `% of the pct network segment, and suggests:<br>
        <ul>
            <li> Average road width of ` + props.osRoadWidthAverage.toFixed(2) + `m</li>
            <li> Minimum road width of ` + props.osRoadWidthMinimum.toFixed(2) + `m</li>
            <li> Average gradient of ` + props.osGradientAverage.toFixed(2) + ` in 1</li>
            <li> Maximum gradient of ` + props.osGradientMax.toFixed(2) + ` in 1</li>
        </ul>`
        :
        'No Ordnance survey data was matched to this segment. <br>'
    }
    var inner = 
    `<h2>PCT Network Segment</h2>` +  (props ?
    `<h3>PCT Network Segment ID:` + props.pctID + `</h3>` +
    osDataHTML
    +
    `The table below shows the increase in cycle uptake that the PCT model estimates would be required to meet the various scenario levels: <br>
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
        <th scope="row">Census 2011</th>
            <td>` + props.bicycle.toFixed(0) + `</td>
            <td>-</td>
        </tr>
        <tr>
            <th scope="row">Government Target (equality)</th>
            <td>` + props.govtarget_slc.toFixed(0) + `</td>
            <td>` + props.govtarget_sic.toFixed(0) + `</td>
        </tr>
        <tr>
            <th scope="row">Government Target (near market)</th>
            <td>` + props.govnearmkt_slc.toFixed(0) + `</td>
            <td>` + props.govnearmkt_sic.toFixed(0) + `</td>
        </tr>
        <tr>
            <th scope="row">Gender equality</th>
            <td>` + props.gendereq_slc.toFixed(0) + `</td>
            <td>` + props.gendereq_sic.toFixed(0) + `</td>
        </tr>
        <tr>
            <th scope="row">Go Dutch</th>
            <td>` + props.dutch_slc.toFixed(0) + `</td>
            <td>` + props.dutch_sic.toFixed(0) + `</td>
        </tr>
        <tr>
            <th scope="row">Ebikes</th>
            <td>` + props.ebike_slc.toFixed(0) + `</td>
            <td>` + props.ebike_sic.toFixed(0) + `</td>
        </tr>
    </table>`
    : 'Hover over a network segment')
    this._div.innerHTML = inner
};

info.addTo(map);






//////////////////////////////////////////////////////////////////////////////////////
// Zoom the map to fit all the layer contents
mapZoomAll()