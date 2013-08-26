/**
 * Natural Heritage Land Trust
 * 
 * Project Explorer Web Map
 * 
 * Based on the GeoExt framework (www.geoext.org),
 * including OpenLayers (openlayers.org)
 * and ExtJS (www.extjs.com).
 * 
 * Google Maps API Key for http://nhlt.org is:
 * ABQIAAAAJw-OGUfYLp62u-_DR4ZOJhRsPagdOlE9amuLgm7nCfXYpAVMdBQ1ajtCrjLqFDEEv8qUEC9PJoHjNQ
 * 
 * Google Maps API Key for http://localhost:8080 is:
 * ABQIAAAAEF62uEvHQb9TuRh5o8TT7xTwM0brOpm-All5BF6PoaKBxRWWERTqVjNVHlDXJ0IugNsW-UFHIAZMRw
 *
 * To export a KML file from ArcGIS, download and install the 'Export to KML' tool written by
 * Kevin Martin at the City of Portland Oregon's Bureau of Planning: http://arcscripts.esri.com/details.asp?dbid=14273
 * 
 * Written by Aaron Stephenson (aaron.j.stephenson [at] gmail.com)
 * March-August 2010
 */


/**
 * Global variables
 */
var map = null;
var mapOrigin = null;
var lyrProjectsNHLT = null;
var lyrPointsNHLT = null;
var nhltKmlStore = null;
var prjFtrSelect = null;
var mapItems = [];
var permalinkProvider = null;


/**
 * Initial function, executed when HTML document is ready in the browser.
 */

Ext.onReady(function(){
	
	/**
	 * Zoom Slider
	 */
	
	var zoomSliderHeight = 100;
	var zoomSlider = new GeoExt.ZoomSlider({
		height: zoomSliderHeight,
		vertical: true,
		aggressive: true,
		plugins: new GeoExt.ZoomSliderTip({
			template: "Zoom Scale   1:{scale}"//<br>Resolution   {resolution}"
		})
	});
	
	mapItems.push(zoomSlider);

	
	/**
	 * Opacity Slider
	 */
	
	if (showOpacitySlider) {
	
		// Opacity slider set up
		var opacSliderWidth = 120;
		var opacText = 'Opacity for ' + opacLyr.name + ': ';
		
		var opacSlider = new GeoExt.LayerOpacitySlider({
			layer: opacLyr,
			width: opacSliderWidth,
			plugins: new GeoExt.LayerOpacitySliderTip({template: opacText + '{opacity}%'})
		});
		
		mapItems.push(opacSlider);
	}
	
	
	/**
	 * Logo
	 */
	
	if (showLogoNHLT) {
	
		// Logo setup
		var logoImg = new Image();
		logoImg.src = nhltLogoUrl;
		var logoWidth = logoImg.width;
		var logoHeight = logoImg.height;
		
		
		// Floating panel to hold the logo
		var logoPanel = new Ext.Panel({
			items: new Ext.BoxComponent({el: logoImg}),
			layout: 'fit',
			border: false,
			frame: false,
			width: logoWidth,
			height: logoHeight,
			bodyStyle: 'background-color:transparent;',
			floating: true,
			shadow: false,
			shim: false
		});
		
		mapItems.push(logoPanel);
	}
	
	
	/** 
	 * Set up Map
	 * 
	 * Set up Layers: basemap and overlays
	 */
	
	/*
	// This commented-out block demonstrates the way to use a Google map as the base map, requiring different setup options
	var mapOptions = {
		projection: webMercator,
		displayProjection: wgs84,
		units: "m",
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,20037508.34, 20037508.34)
	};
	map = new OpenLayers.Map('map', mapOptions);
	var gmap = new OpenLayers.Layer.Google("Google", {type: G_NORMAL_MAP, sphericalMercator:true});
	map.addLayer(gmap);
	
	// Set initial extent for map using Google base map
	var origExtentGoog = coordTransform(new OpenLayers.Bounds(-90, 42, -89, 44));
	*/
	
	// Map with no OpenLayers controls
	map = new OpenLayers.Map( "map", {controls: []} );

	// NHLT points layer style
	var stylePointsNHLT = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			externalGraphic: icon_blue,
			graphicHeight: 32,
			graphicZIndex: 3
		})
	});
			
	// NHLT points layer setup
	lyrPointsNHLT = new OpenLayers.Layer.Vector("NHLT Info Points",{
		styleMap: stylePointsNHLT,
		maxResolution: 6,
		displayInLayerSwitcher: false,
		projection: wgs84,
		strategies: [new OpenLayers.Strategy.Fixed()],
		protocol: new OpenLayers.Protocol.HTTP({
			url: nhltPointsKmlUrl,
			format: new OpenLayers.Format.KML({extractStyles: false, extractAttributes: true})
		})
	});
	
	// NHLT project layer style
	var styleProjectsNHLT = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			fillColor: "#228B22",
			strokeColor: "#32CD32",
			strokeWidth: 4,
			fillOpacity: 0.4,
			graphicZIndex: 1
		}),
		"select": new OpenLayers.Style({
			fillColor: "#66ccff",
			strokeColor: "#3399ff",
			graphicZIndex: 2
		})
	});
	
	// NHLT projects layer setup
	lyrProjectsNHLT = new OpenLayers.Layer.Vector("NHLT Projects",{
		styleMap: styleProjectsNHLT,
		rendererOptions: {zIndexing: true},
		maxResolution: 0.00025  // NOTE: I have no idea why this works, but it just does.
		                        // I had intended to use 'minResolution: 6' instead
								// (to correspond with the 'maxResolution: 6' property setting on lyrPointsNHLT),
								// but that approach just wouldn't work.
	});
	
	// GeoExt store that will hold NHLT features, with setup for visible attributes
	nhltKmlStore = new GeoExt.data.FeatureStore({
	    layer: lyrProjectsNHLT,
	    proxy: new GeoExt.data.ProtocolProxy({
	        protocol: new OpenLayers.Protocol.HTTP({
	            url: nhltProjectsKmlUrl,
	            format: new OpenLayers.Format.KML()
	        })
	    }),
	    fields: nhltFields,
		idIndex: 0,
		sortInfo: {field: 'Type', direction: 'ASC'},
	    autoLoad: true
	});
	
	/*
	// Alternate way to create a layer from KML, but without the dynamic link to the grid (table)
	var lyrProjectsNHLT = new OpenLayers.Layer.Vector("NHLT Projects",{
		projection: wgs84,
		strategies: [new OpenLayers.Strategy.Fixed()],
		protocol: new OpenLayers.Protocol.HTTP({
			url: nhltKmlUrl,
			format: new OpenLayers.Format.KML({extractStyles: true, extractAttributes: true})
		})
	});
	*/
	
	// Add the NHLT projects and points layers to the map
	map.addLayer(lyrPointsNHLT);
	map.addLayer(lyrProjectsNHLT);
	
	// Optional layer to show original zoom extent of the map, set by 'showOrigExtent' variable in config.js
	if (showOrigExtent) {
		var boxes  = new OpenLayers.Layer.Boxes('Original Extent');
		var box = new OpenLayers.Marker.Box(origExtent);
		boxes.addMarker(box);
		map.addLayer(boxes);
	}
	
	// Grid (table) to hold attributes from NHLT features, dynamically tied to NHLT layer
	var nhltGridPanel = new Ext.grid.GridPanel({
	    store: nhltKmlStore,
	    columns: nhltGridColumnModel,
	    sm: new GeoExt.grid.FeatureSelectionModel(),
		title: 'NHLT Project List',
		id: 'listpanel'
	});
	
		// Add ArcGIS Online layers to the map
	for (var i = 0; i < lyrsAGS.length; i++) {
		map.addLayer(lyrsAGS[i]);
	}
	
	// Add WI DOA GIO layers to the map
	for (var i = 0; i < lyrsWI.length; i++) {
		map.addLayer(lyrsWI[i]);
	}
	
	/*
	// Add Google layers to the map
	for (var i = 0; i < lyrsGoogle.length; i++) {
		map.addLayer(lyrsGoogle[i]);
	}
	*/

	
	/**
	 * Set up Layout
	 * 
	 * Two sections: left for map panel, right for attribute grid (table) panel
	 */
	 
	var mapPage = new Ext.Viewport({
		layout: 'border',
		items: [{
			region: 'center',
			id: 'mappanel',
			title: 'Map',
			xtype: 'gx_mappanel',
			map: map,
			extent: origExtent,
			items: mapItems,
			stateId: 'map',
			prettyStateKeys: true,
			split: true
		}, {
			region: 'west',
			id: 'blankpanel',
			xtype: 'panel',
			layout: 'fit',
			border: false,
			frame: false,
			width: 1,
			height: 1,
			shadow: false,
			shim: false
		}, {
			region: 'east',
			id: 'listpanelcontainer',
			xtype: 'panel',
			layout: 'fit',
			width: 430,
			items: nhltGridPanel,
			split: true
		}]
	});
	
	// Map dimensions
	mapOrigin = Ext.getCmp('mappanel').getPosition();
	var mapHeight = Ext.getCmp('mappanel').getInnerHeight();
	var mapWidth = Ext.getCmp('mappanel').getInnerWidth();
	
	
	/**
	 * Map Navigation Controls
	 */
	
	// Navigation buttons
	//var mouseDefaults = new OpenLayers.Control.MouseDefaults({title:'Pan the map by clicking and dragging'});
	var mouseNav = new OpenLayers.Control.Navigation({zoomBoxEnabled:false});
	var dragPan = new OpenLayers.Control.DragPan({title:'Pan the map by clicking and dragging', id: 'dragPanID'});
	var zoomBox = new OpenLayers.Control.ZoomBox({title:'Zoom on an area by clicking and dragging'});
	//var zoomToMaxExtent = new OpenLayers.Control.ZoomToMaxExtent({title:'Zoom to the max extent'});
	var zoomOrigExtent = new OpenLayers.Control.Button({
		title: 'Zoom to the original extent of the map',
		displayClass: 'btnZoomOrigExtent',
		trigger: function(){zoomToOrigExtent()}
	});
	var navHistory = new OpenLayers.Control.NavigationHistory();
	map.addControl(navHistory);
	
	var navControls = [
			//mouseDefaults,
			dragPan,
			zoomBox,
			//zoomToMaxExtent,
			zoomOrigExtent,
			navHistory.previous,
			navHistory.next
		];
	
	var navToolbar = new OpenLayers.Control.Panel();
	navToolbar.addControls(navControls);
	map.addControl(navToolbar);
	map.addControl(mouseNav);
	
	
	/**
	 * Other Map Controls
	 */
		
	// NHLT project feature selector
	buildPrjFtrSelect(lyrProjectsNHLT);
	buildPntFtrSelect(lyrPointsNHLT);
	
	// Layer Switcher control for map
	var lyrSwitcher = new OpenLayers.Control.LayerSwitcher({id:'lyrSwitcherID', roundedCorner:true, roundedCornerColor:lyrSwitcherColor, activeColor:lyrSwitcherColor});
	map.addControl(lyrSwitcher);
	if (showMaximizedLayerSwitcher){
		lyrSwitcher.maximizeControl();
	}
	
	// Zoom Slider (set position to upper left corner of the map panel, under the toolbar)
	var zoomSliderAnchorX = 50; //zoomSliderHeight;
	zoomSlider.setPosition(mapOrigin[0] + 5, mapOrigin[1] + zoomSliderAnchorX);
	
	// Opacity Slider (set position to upper right corner of the map panel)
	if (showOpacitySlider) {
		var opacSliderAnchorY = mapWidth - opacSliderWidth - 10;
		opacSlider.setPosition(mapOrigin[0] + opacSliderAnchorY, mapOrigin[1] + 0);
	}
	
	// Logo (set position to the lower left corner of the map panel)
	if (showLogoNHLT) {
		var logoAnchorX = mapHeight - logoHeight;
		logoPanel.setPosition(mapOrigin[0] + 0, mapOrigin[1] + logoAnchorX);
	}
	
	/*
	// Permalink
	permalinkProvider = new GeoExt.state.PermalinkProvider({encodeType: false});
    Ext.state.Manager.setProvider(permalinkProvider);
	permalinkProvider.on({
		statechanged: function(provider, name, value){
			alert(provider.getLink());
		}}
	);
	*/
	
	Ext.getCmp('mappanel').doLayout();
	
	// Zoom to features
	//map.zoomToExtent(lyrProjectsNHLT.getDataExtent());
	zoomToOrigExtent;
	
	map.getControl('dragPanID').activate();


});
// End of init() function


/**
 * Function to zoom to the original (pre-defined by the developer) extent
 */
function zoomToOrigExtent(){
	map.zoomToExtent(origExtent);
}


/**
 * Function to transform coordinates of an object from WGS 84 to Web Mercator
 */
function coordTransform(obj){
	obj.transform(wgs84, webMercator);
	return obj
}


/**
 * Function to add a select control to the point feature layer
 */
function buildPntFtrSelect(layer){
    pntFtrSelect = new OpenLayers.Control.SelectFeature(layer);
    layer.events.on({
        'featureselected': function(e) {
			var projectName = e.feature.attributes.Project.value;
			var matchedIndex = nhltKmlStore.find('Project',projectName,0,false,true);
			var matchedRecord = nhltKmlStore.getAt(matchedIndex);
			prjFtrSelect.clickFeature(lyrProjectsNHLT.getFeatureById(matchedRecord.id));
        }
    });
	
	map.addControl(pntFtrSelect);
	pntFtrSelect.activate();
}


/**
 * Function to add a select control to the project feature layer
 */
function buildPrjFtrSelect(layer){
	prjFtrSelect = new OpenLayers.Control.SelectFeature(layer);
	layer.events.on({
		'featureselected': onFeatureSelect,
		'featureunselected': onFeatureUnselect
	});
	
	map.addControl(prjFtrSelect);
	prjFtrSelect.activate();
}

/**
 * Function to empty the state on a feature select when the popup is closed
 */
function onPopupClose(evt) {
	prjFtrSelect.unselectAll();
}


/**
 * Function to do something when a feature is selected
 * 
 * Currently, will zoom to the feature and create a popup
 */
function onFeatureSelect(event) {
	var feature = event.feature;
	
	var ftrCoords = feature.geometry.getBounds().toBBOX().split(",");
	
	// Zoom to the selected feature
	map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 14, false, false);
	
	// How the fields will be presented in the pop-up
	var popupContent =
		"<div style=\"width:400px;\"><h2>" + feature.attributes.Project.value + "</h2>" + "<br />"
		+ "<b>Public Access:</b> " + feature.attributes.PublicAccess.value + "<br />"
		+ "<b>Type:</b> " + feature.attributes.Type.value + "<br />"
		+ "<b>Size:</b> " + feature.attributes.OfficialAcres.value + " acres <br />"
		+ "<b>Location:</b> " + feature.attributes.Jurisdiction.value + ", " + feature.attributes.County.value + " County <br />"
		+ "<b>Description:</b> " + feature.attributes.Description.value + "<br /></div>"
	;
	//alert(popupContent);
	
	// Since KML is user-generated, do naive protection against Javascript.
	if (popupContent.search("<script") != -1) {
		popupContent = "Content contained Javascript! Escaped content below.<br />" + popupContent.replace(/</g, "&lt;");
	}
	
	popup = new OpenLayers.Popup.FramedCloud(
		"projectPopup",
		feature.geometry.getBounds().getCenterLonLat(),//new OpenLayers.LonLat(ftrCoords[0],ftrCoords[1]),
		new OpenLayers.Size(600,200),
		popupContent,
		null,//{size:new OpenLayers.Size(200,200), offset:new OpenLayers.Pixel(ftrCoords[0],ftrCoords[1])},
		true,
		onPopupClose
	);
	feature.popup = popup;
	map.addPopup(popup);
}


/**
 * Function to do something when a feature is unselected
 * 
 * Currently, will destroy a popup
 */
function onFeatureUnselect(event) {
	var feature = event.feature;
	if(feature.popup) {
		map.removePopup(feature.popup);
		feature.popup.destroy();
		delete feature.popup;
	}
}


/**
 * Functions to sort a grid (table)
 */
function sortStoreAsc(store,field){
	store.sort(field,'ASC');
}

function sortStoreDesc(store,field){
	store.sort(field,'DESC');
}