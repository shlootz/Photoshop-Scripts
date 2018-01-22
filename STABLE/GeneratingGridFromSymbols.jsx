﻿#target photoshopapp.bringToFront();// This script exports Adobe Photoshop layers as individual PNGs. It also// writes a JSON file which can be imported into Spine where the images// will be displayed in the same positions and draw order.// Copyright (c) 2012-2017, Esoteric Software// All rights reserved.// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met://     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.//     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.//     * Neither the name of Esoteric Software nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.var cs2 = parseInt(app.version) < 10;var originalDoc;try {	doc = app.activeDocument;} catch (ignored) {}var defaultSettings = {        reels:5,        symbolsPerReel:3,        symbolWidth:200,        symbolHeight:100,        symbolsHorizontalGap:5,        symbolsVerticalGap:5,        initX:0,        initY:0,        reelDeviders:false,        nearMiss:false    };var strtRulerUnits = app.preferences.rulerUnits;  var strtTypeUnits = app.preferences.typeUnits;  app.preferences.rulerUnits = Units.PIXELS;  app.preferences.typeUnits = TypeUnits.PIXELS;  var newLayerSet = doc.layerSets.add();   newLayerSet.name = "TECHNICAL_LAYER";var Colour = new SolidColor;  Colour.rgb.hexValue = 'ff00ff';  //doc.layers.itemByName("test"); //run();showSettingsDialog();function run(){     var w = defaultSettings.symbolWidth;     var h = defaultSettings.symbolHeight;     var x = defaultSettings.initX;     var y = defaultSettings.initY;         for (var i = 0; i < defaultSettings.reels; i++) {                for (var j = 0; j < defaultSettings.symbolsPerReel; j++) {            var myLayer = doc.artLayers.add();              myLayer.move(newLayerSet, ElementPlacement.INSIDE);              myLayer.name = "Tech_Symbol_"+String(i+j)+"_noExport"            drawRect(x+i*(w + defaultSettings.symbolsHorizontalGap), y+j*(h + defaultSettings.symbolsVerticalGap), w, h);        }    }    for (var m=0; m<defaultSettings.symbolsPerReel; m++){            guideLine(y+m*(h + defaultSettings.symbolsVerticalGap), "Hrzn");            guideLine(y+m*(h + defaultSettings.symbolsVerticalGap)+h, "Hrzn");        }         for (var n=0; n<defaultSettings.reels; n++){            guideLine(x+n*(w + defaultSettings.symbolsHorizontalGap), "Vrtc");            guideLine(x+n*(w + defaultSettings.symbolsHorizontalGap)+w, "Vrtc");        }}function drawRect(x, y, w, h) {    activeDocument.selection.select([[x, y], [x+w, y], [x+w, y+h], [x,y+h]], SelectionType.REPLACE, 0, false);      activeDocument.selection.stroke (Colour, 1, StrokeLocation.INSIDE,ColorBlendMode.NORMAL,100);      //activeDocument.selection.fill(Colour)    activeDocument.selection.deselect();          makeCircle(x+w/2 - 2,y+h/2 - 2, x+w/2 + 2, y+h/2 + 2, false);    activeDocument.selection.stroke (Colour, 1, StrokeLocation.INSIDE,ColorBlendMode.NORMAL,100);     activeDocument.selection.deselect();  }function makeCircle(left,top,right,bottom,antiAlias){var circleSelection = charIDToTypeID( "setd" );    var descriptor = new ActionDescriptor();    var id71 = charIDToTypeID( "null" );        var ref5 = new ActionReference();        var id72 = charIDToTypeID( "Chnl" );        var id73 = charIDToTypeID( "fsel" );        ref5.putProperty( id72, id73 );    descriptor.putReference( id71, ref5 );    var id74 = charIDToTypeID( "T   " );        var desc12 = new ActionDescriptor();        var top1 = charIDToTypeID( "Top " );        var top2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( top1, top2, top );        var left1 = charIDToTypeID( "Left" );        var left2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( left1, left2, left );        var bottom1 = charIDToTypeID( "Btom" );        var bottom2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( bottom1, bottom2, bottom );        var right1 = charIDToTypeID( "Rght" );        var right2 = charIDToTypeID( "#Pxl" );        desc12.putUnitDouble( right1, right2, right );    var id83 = charIDToTypeID( "Elps" );    descriptor.putObject( id74, id83, desc12 );    var id84 = charIDToTypeID( "AntA" );    descriptor.putBoolean( id84, antiAlias );executeAction( circleSelection, descriptor, DialogModes.NO );}function showSettingsDialog () {        // Layout.	var dialog = new Window("dialog", "Grid Generator v1.1"), group;	dialog.alignChildren = "fill";        var outputPathGroup = dialog.add("panel", undefined, "Output Paths");		outputPathGroup.alignChildren = ["fill", ""];		outputPathGroup.margins = [10,15,10,10];		var v1, v2, v3, v4, v5, v6, v7, v8;			var textGroup = outputPathGroup.add("group");			textGroup.orientation = "column";			textGroup.alignChildren = ["fill", ""];			            group = textGroup.add("group");            				group.add("statictext", undefined, "Nr. of Reels:");				v1 = group.add("edittext", undefined, defaultSettings.reels);				v1.alignment = ["fill", ""];                                  group.add("statictext", undefined, "Nr. of symbols per reel:");				v2 = group.add("edittext", undefined, defaultSettings.symbolsPerReel);				v2.alignment = ["fill", ""];                             group = textGroup.add("group");            				group.add("statictext", undefined, "Symbol Width");				v3 = group.add("edittext", undefined, defaultSettings.symbolWidth);				v3.alignment = ["fill", ""];                                  group.add("statictext", undefined, "Symbol Height");				v4 = group.add("edittext", undefined, defaultSettings.symbolHeight);				v4.alignment = ["fill", ""];                                group = textGroup.add("group");               				group.add("statictext", undefined, "Reels gap");				v5 = group.add("edittext", undefined, defaultSettings.symbolsHorizontalGap);				v5.alignment = ["fill", ""];                                  group.add("statictext", undefined, "Symbols gap");				v6 = group.add("edittext", undefined, defaultSettings.symbolsVerticalGap);				v6.alignment = ["fill", ""];                                  group = textGroup.add("group");               				group.add("statictext", undefined, "Start Position X");				v7 = group.add("edittext", undefined, defaultSettings.initX);				v7.alignment = ["fill", ""];                                  group.add("statictext", undefined, "Start Position Y");				v8 = group.add("edittext", undefined, defaultSettings.initY);				v8.alignment = ["fill", ""];                                        			imagesDirPreview = textGroup.add("statictext", undefined, "");			imagesDirPreview.maximumSize.width = 260;			group = textGroup.add("group");                            var buttonGroup = dialog.add("group");		group = buttonGroup.add("group");			group.alignment = ["fill", ""];			group.alignChildren = ["right", ""];			var runButton = group.add("button", undefined, "OK");			var cancelButton = group.add("button", undefined, "Cancel");                      runButton.onClick = function () {                                               defaultSettings.reels = Number(v1.text);                defaultSettings.symbolsPerReel = Number(v2.text);                defaultSettings.symbolWidth = Number(v3.text);                defaultSettings.symbolHeight = Number(v4.text);                defaultSettings.symbolsHorizontalGap = Number(v5.text);                defaultSettings.symbolsVerticalGap = Number(v6.text);                defaultSettings.initX = Number(v7.text);                defaultSettings.initY = Number(v8.text);                                 run();                                        $.writeln(defaultSettings.reels);                $.writeln(defaultSettings.symbolsPerReel);                $.writeln(defaultSettings.symbolWidth);                $.writeln(defaultSettings.symbolHeight);                $.writeln(defaultSettings.symbolsHorizontalGap);                $.writeln(defaultSettings.symbolsVerticalGap);                                dialog.close();              }                    cancelButton.onClick = function(){                cancel = true;                dialog.close();                return;              }               dialog.center();	dialog.show();    }//types: Vrtc Hrznfunction guideLine(position, type) {    var id296 = charIDToTypeID( "Mk  " );        var desc50 = new ActionDescriptor();        var id297 = charIDToTypeID( "Nw  " );            var desc51 = new ActionDescriptor();            var id298 = charIDToTypeID( "Pstn" );            var id299 = charIDToTypeID( "#Pxl" );            desc51.putUnitDouble( id298, id299, position );            var id300 = charIDToTypeID( "Ornt" );            var id301 = charIDToTypeID( "Ornt" );            var id302 = charIDToTypeID( type );           desc51.putEnumerated( id300, id301, id302 );           var id303 = charIDToTypeID( "Gd  " );        desc50.putObject( id297, id303, desc51 );    executeAction( id296, desc50, DialogModes.NO ); };