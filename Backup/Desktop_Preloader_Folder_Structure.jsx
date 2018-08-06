﻿#target photoshopapp.bringToFront();var cs2 = parseInt(app.version) < 10;var originalDoc;try {	doc = app.activeDocument;} catch (ignored) {}var defaultSettings = {        reels:5,        symbolsPerReel:3,        symbolWidth:200,        symbolHeight:100,        symbolsHorizontalGap:5,        symbolsVerticalGap:5,        initX:0,        initY:0,        reelDeviders:false,        nearMiss:false,        generateGuides:false    };var strtRulerUnits = app.preferences.rulerUnits;  var strtTypeUnits = app.preferences.typeUnits;  app.preferences.rulerUnits = Units.PIXELS;  app.preferences.typeUnits = TypeUnits.PIXELS;  var newLayerSet;//var Colour = new SolidColor;  //Colour.rgb.hexValue = 'ff00ff';  var Colour_LINE = new SolidColor;  Colour_LINE.rgb.hexValue = '0cff00';  var Colour_REELS = new SolidColor;  Colour_REELS.rgb.hexValue = '19e7e5';  var Colour_SYMBOL = new SolidColor;  Colour_SYMBOL.rgb.hexValue = 'ff0000';  var Colour_CENTER = new SolidColor;  Colour_CENTER.rgb.hexValue = 'ffffff';  var Colour_STROKE = new SolidColor;  Colour_STROKE.rgb.hexValue = 'ff00ff';  var Colour_AREA = new SolidColor;  Colour_AREA.rgb.hexValue = 'ffa800';  //doc.layers.itemByName("test"); //run();//showSettingsDialog();//{layer: "Test", children: [{layer: "Test", children: []}, {layer: "Test", children: []}, {layer: "Test", children: []}]}    var layersStructureArray = [   {       "name":"PreloaderModuleAssets",       "type":"layer",       "children":[                  {               "name":"content",               "type":"layer",               "children":[ {                    "name":"Tech_BG_noExport",                    "children":[],                    "type":"rect"                 }]               },               {               "name":"background",               "type":"layer",               "children":[]               }           ]       }];run();function run(){         for (var i=0; i<layersStructureArray.length; i++){        createLayer(layersStructureArray[i], doc)        }}function createLayer(layerObject, parent){    var name = layerObject["name"];    var children = layerObject["children"];    var type = layerObject["type"];    var newLayerSet;            newLayerSet = parent.layerSets.add();               newLayerSet.name = name;                        if(type === "rect")            {                var layer = newLayerSet.artLayers.add();                layer.name = name;                drawRect(0,0,3168,1440,Colour_SYMBOL);             }                        if(children.length > 0) {                        for (var i=0; i<children.length; i++){                            createLayer(children[i], newLayerSet)                        }                }    }/*function createLayer(name, color, sublayers, customFunction){    newLayerSet = doc.layerSets.add();       newLayerSet.name = name;    layerColour(color);           for(var i=0; i<sublayers.length; i++)       {           var subLayerSet = newLayerSet.layerSets.add();             subLayerSet.name = sublayers[i];           layerColour(color);                 }             if(customFunction != undefined){            customFunction.call();            }         }*/function drawSafeArea(){    //drawRect }function drawRect(x, y, w, h, color) {    activeDocument.selection.select([[x, y], [x+w, y], [x+w, y+h], [x,y+h]], SelectionType.REPLACE, 0, false);      activeDocument.selection.stroke(Colour_STROKE, 1, StrokeLocation.INSIDE,ColorBlendMode.NORMAL,25);      activeDocument.selection.fill(color, ColorBlendMode.NORMAL, 25);    activeDocument.selection.deselect();          makeCircle(x+w/2 - 2,y+h/2 - 2, x+w/2 + 2, y+h/2 + 2, false);    activeDocument.selection.stroke (Colour_CENTER, 1, StrokeLocation.INSIDE,ColorBlendMode.NORMAL,10, true);     activeDocument.selection.deselect();  }function makeCircle(left,top,right,bottom,antiAlias){var circleSelection = charIDToTypeID( "setd" );    var descriptor = new ActionDescriptor();    var id71 = charIDToTypeID( "null" );        var ref5 = new ActionReference();        var id72 = charIDToTypeID( "Chnl" );        var id73 = charIDToTypeID( "fsel" );        ref5.putProperty( id72, id73 );    descriptor.putReference( id71, ref5 );    var id74 = charIDToTypeID( "T   " );        var desc12 = new ActionDescriptor();        var top1 = charIDToTypeID( "Top " );        var top2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( top1, top2, top );        var left1 = charIDToTypeID( "Left" );        var left2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( left1, left2, left );        var bottom1 = charIDToTypeID( "Btom" );        var bottom2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( bottom1, bottom2, bottom );        var right1 = charIDToTypeID( "Rght" );        var right2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( right1, right2, right );    var id83 = charIDToTypeID( "Elps" );    descriptor.putObject( id74, id83, desc12 );    var id84 = charIDToTypeID( "AntA" );    descriptor.putBoolean( id84, antiAlias );    executeAction( circleSelection, descriptor, DialogModes.NO );}function showSettingsDialog () {        // Layout.	var dialog = new Window("dialog", "Chtulhu empty project layers"), group;	dialog.alignChildren = "fill";         try {		dialog.add("image", undefined, new File(scriptDir() + "logo2.png"));	} catch (error) {alert(error)}                var buttonGroup = dialog.add("group");		group = buttonGroup.add("group");			group.alignment = ["fill", ""];			group.alignChildren = ["right", ""];			var runButton = group.add("button", undefined, "Create");			var cancelButton = group.add("button", undefined, "Cancel");                      runButton.onClick = function () {                                                 run();                        dialog.close();              }                    cancelButton.onClick = function(){                cancel = true;                dialog.close();                return;              }         dialog.center();	 dialog.show();    }//types: Vrtc Hrznfunction guideLine(position, type) {    var id296 = charIDToTypeID( "Mk  " );        var desc50 = new ActionDescriptor();        var id297 = charIDToTypeID( "Nw  " );            var desc51 = new ActionDescriptor();            var id298 = charIDToTypeID( "Pstn" );            var id299 = charIDToTypeID( "#Pxl" );            desc51.putUnitDouble( id298, id299, position );            var id300 = charIDToTypeID( "Ornt" );            var id301 = charIDToTypeID( "Ornt" );            var id302 = charIDToTypeID( type );           desc51.putEnumerated( id300, id301, id302 );           var id303 = charIDToTypeID( "Gd  " );        desc50.putObject( id297, id303, desc51 );    executeAction( id296, desc50, DialogModes.NO ); };function layerColour(colour) {      switch (colour.toLocaleLowerCase()){          case 'red': colour = 'Rd  '; break;          case 'orange' : colour = 'Orng'; break;          case 'yellow' : colour = 'Ylw '; break;          case 'yellow' : colour = 'Ylw '; break;          case 'green' : colour = 'Grn '; break;          case 'blue' : colour = 'Bl  '; break;          case 'violet' : colour = 'Vlt '; break;          case 'gray' : colour = 'Gry '; break;          case 'none' : colour = 'None'; break;          default : colour = 'None'; break;          }      var desc = new ActionDescriptor();          var ref = new ActionReference();          ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );      desc.putReference( charIDToTypeID('null'), ref );          var desc2 = new ActionDescriptor();          desc2.putEnumerated( charIDToTypeID('Clr '), charIDToTypeID('Clr '), charIDToTypeID(colour) );      desc.putObject( charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2 );      executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );  };  function scriptDir () {	var file;	if (!cs2)		file = $.fileName;	else {		try {			var error = THROW_ERROR; // Force error which provides the script file name.		} catch (ex) {			file = ex.fileName;		}	}	return new File(file).parent + "/";}