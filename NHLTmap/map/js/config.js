/**
*   Start-up preferences
*/

// Relative location of the NHLT projects source KML
var nhltProjectsKmlUrl = './kml/NHLT_Projects.kml'; // NOTE: ArcGIS 'Export to KML' tool can be found at http://arcscripts.esri.com/details.asp?dbid=14273
var nhltPointsKmlUrl = './kml/NHLT_Project_Points.kml';
// Relative location of the NHLT logo
var nhltLogoUrl = 'img/NHLT_logo_transparent.png';
// Set whether or not the NHLT logo will be shown on the map
var showLogoNHLT = true;
// Relative locations of the marker icons
var icon_blue = 'img/iimm2-blue.png';
var icon_green = 'img/iimm2-green.png';
var icon_orange = 'img/iimm2-orange.png';
var icon_red = 'img/iimm2-red.png';
// Projections used in map
var wgs84 = new OpenLayers.Projection('EPSG:4326');
var webMercator = new OpenLayers.Projection('EPSG:900913');
// Set initial extent for map
var origExtent = new OpenLayers.Bounds(-90.3, 42.5, -89.0, 43.8);
// Set whether or not the original extent will be shown as a box layer on the map
var showOrigExtent = false;
// Set whether or not the opacity slider will be shown on the map
var showOpacitySlider = false;
// Relative location of the loading GIF image
var loaderImgUrl = 'img/bigrotation2.gif';
// Set whether or not the layer switcher will be maximized on the map at startup
var showMaximizedLayerSwitcher = true;
// Set the color of the layer switcher on the map
var lyrSwitcherColor = 'darkgoldenrod'; // NOTE: This variable was used by the layer switcher constructor's activeColor property,
//                                               and this worked in OpenLayers version 2.8, but not after the upgrade to 2.9.
//                                               To change the color in 2.9, you have to manually alter the css background-image
//                                               style property in '../css/map.css'

// NOTE: image locations for navigation buttons (pan, zoom, etc) and their toolbar panel
//       are set in '../css/map.css' as background-image style properties


/**
*  Attribute grid (table) set up
*/

// Fields from KML to use in attribute grid (table) and pop-up
var nhltFields = [
	{name: 'Project', type: 'string', mapping:'Project.value'},
	{name: 'Public', type: 'string', mapping:'PublicAccess.value'},
	{name: 'Type', type: 'string', mapping:'Type.value'},
	{name: 'Acres', type: 'string', mapping:'OfficialAcres.value'},
	{name: 'Jurisdiction', type: 'string', mapping:'Jurisdiction.value'},
	{name: 'County', type: 'string', mapping:'County.value'},
	{name: 'Description', type: 'string', mapping:'Description.value'}
];


// How the fields will be presented in the grid (table).  "dataIndex" below = "name" from nhltFields
var nhltGridColumnModel = [
	{header: 'Name', dataIndex: 'Project', width: 160, sortable: true, menuDisabled: true},
	{header: 'Public', dataIndex: 'Public', width: 40, sortable: true, menuDisabled: true},
	{header: 'Type', dataIndex: 'Type', width: 200, sortable: true, menuDisabled: true}
];


/**
*  Layers from ESRI's ArcGIS Online
*/

var lyrEsriStreetMapWorld2D = new OpenLayers.Layer.ArcGIS93Rest(
	"World Street Map",
	"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);

var lyrEsriImageryWorld2D = new OpenLayers.Layer.ArcGIS93Rest(
	"World Imagery",
	"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);

var lyrEsriShadedReliefWorld2D = new OpenLayers.Layer.ArcGIS93Rest(
	"Shaded Relief",
	"http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_ShadedRelief_World_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);

var lyrGeoeyeImageryWorld2D = new OpenLayers.Layer.ArcGIS93Rest(
	"GeoEye Hi-Res World Imagery",
	"http://server.arcgisonline.com/ArcGIS/rest/services/GeoEye_Imagery_World_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);

var lyrI3ImageryWorld2D = new OpenLayers.Layer.ArcGIS93Rest(
	//"I3 Hi-Res Imagery",
	"World Imagery (I3 Hi-Res)",
	"http://server.arcgisonline.com/ArcGIS/rest/services/I3_Imagery_Prime_World_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);

var lyrNpsPhysWorld2D = new OpenLayers.Layer.ArcGIS93Rest(
	"National Park Service Physical",
	"http://server.arcgisonline.com/ArcGIS/rest/services/NPS_Physical_World_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);

var lyrNgsTopoUS2D = new OpenLayers.Layer.ArcGIS93Rest(
	//"National Geographic Society Topography",
	"Topography (National Geographic)",
	"http://server.arcgisonline.com/ArcGIS/rest/services/NGS_Topo_US_2D/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0"
	}
);


var lyrsAGS = [
	lyrEsriStreetMapWorld2D,
	//lyrEsriImageryWorld2D,
	//lyrEsriShadedReliefWorld2D,
	//lyrGeoeyeImageryWorld2D,
	lyrI3ImageryWorld2D,
	//lyrNpsPhysWorld2D,
	lyrNgsTopoUS2D
];


/**
*  Layers from the Wisconsin Spatial Data Repository
* (State of Wisconsin's Department of Administration's Geographic Information Office
* (doa.wi.gov, gio.wi.gov, gis.wi.gov)
*/

var lyrWiPLSS = new OpenLayers.Layer.ArcGIS93Rest(
	"Wisconsin Public Land Survey",
	"http://gis.wi.gov/AGS/rest/services/WSDR_Planning_Cadastral/Landnet_State_WI/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0,1,2,3",
		format: "png24",
		transparent: "true"
	}
);
lyrWiPLSS.isBaseLayer = false;
lyrWiPLSS.visibility = false;

var lyrWiMunis = new OpenLayers.Layer.ArcGIS93Rest(
	"Wisconsin Municipalities",
	"http://gis.wi.gov/AGS/rest/services/WSDR_Boundaries/MinorCivilDivisions_State_WI/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0,1",
		format: "png24",
		transparent: "true"
	}
);
lyrWiMunis.isBaseLayer = false;
lyrWiMunis.visibility = false;

var lyrWiMunisLabels = new OpenLayers.Layer.ArcGIS93Rest(
	"Wisconsin Municipality Labels",
	"http://gis.wi.gov/AGS/rest/services/WSDR_Boundaries/MinorCivilDivisions_State_WI/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:4,5",
		format: "png24",
		transparent: "true"
	}
);
lyrWiMunisLabels.isBaseLayer = false;
lyrWiMunisLabels.visibility = false;

var lyrWiCounties = new OpenLayers.Layer.ArcGIS93Rest(
	"Wisconsin Counties",
	"http://gis.wi.gov/AGS/rest/services/WSDR_Boundaries/Counties_State_WI/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:0",
		format: "png24",
		transparent: "true"
	}
);
lyrWiCounties.isBaseLayer = false;
lyrWiCounties.visibility = false;

var lyrWiCountyLabels = new OpenLayers.Layer.ArcGIS93Rest(
	"Wisconsin County Labels",
	"http://gis.wi.gov/AGS/rest/services/WSDR_Boundaries/Counties_State_WI/MapServer/export",
	{
		//bbox: "-20037507.0671618,-19971868.8804086,20037507.0671618,19971868.8804086",
		layers: "show:1,2,3",
		format: "png24",
		transparent: "true"
	}
);
lyrWiCountyLabels.isBaseLayer = false;
lyrWiCountyLabels.visibility = false;


var lyrsWI = [
	lyrWiPLSS,
	lyrWiMunis,
	lyrWiMunisLabels,
	lyrWiCounties,
	lyrWiCountyLabels
];


/**
*  Layers from Google
*/

//  var lyrGmapNormal = new OpenLayers.Layer.Google("Google Streets", {type: G_NORMAL_MAP, sphericalMercator:true});
//  var lyrGmapSatellite = new OpenLayers.Layer.Google("Google Satellite", {type: G_SATELLITE_MAP , sphericalMercator:true});
//  var lyrGmapHybrid = new OpenLayers.Layer.Google("Google Hybrid", {type: G_HYBRID_MAP , sphericalMercator:true});
//  var lyrGmapPhysical = new OpenLayers.Layer.Google("Google Terrain", {type: G_PHYSICAL_MAP , sphericalMercator:true});

//  var lyrsGoogle = [lyrGmapNormal, lyrGmapSatellite, lyrGmapHybrid, lyrGmapPhysical];


// Set which layer from list above will be connected to the opacity slider
var opacLyr = lyrEsriStreetMapWorld2D;