// https://forums.adobe.com/thread/1536677#
app.activeDocument.suspendHistory("bcm_layerInfo", "runMulti()");    

function runMulti(){
    var selLay = getSelectedLayersIdx();
    if( selLay.constructor != Array ) selLay = [ selLay ];
    var selIDXF =  new File(Folder.temp +"/selIDX.txt");
    while(selLay.length != 0){
    // for( var i=0; i<selLay.length; i++){
        multiSelectByIDx(selLay[0]);
        if( activeDocument.activeLayer.kind == "LayerKind.SMARTOBJECT"){// if it's a smart object close 
        //terminate this script an create event listener for the transform then use a vb script to 
        //sent Ctrl+T key stroke and the enter, this way the transform event will be tirggered, the next 
        // step will be to find out from the transform event the Angle and after that the Smart object's scale
            selLay.splice(0, 1);
            selIDXF.open('w');
            selIDXF.write("selLay = "+selLay.toSource());//this file will be read to see what are the other layers to be computed
            selIDXF.close();
            getTheSMScale();// here the script execute the vb script
            break;
        }else{
            selLay.splice(0, 1);
            selIDXF.open('w');
            selIDXF.write("selLay = "+selLay.toSource());
            selIDXF.close();
            run();
            if(selLay.length == 0){
                alert('finished creating Info text layers');
            }
        }
    }

}
function run(){
   var docRef = app.activeDocument;
var layerRef = docRef.activeLayer;
var docWidth = docRef.width;
var layer = activeDocument.activeLayer; //Grab the currently selected layer
var myLayer = activeDocument.activeLayer.name;
var isSmObj = false;
var SMObjScales = {w:100, h:100};
// alert(layer.kind);
if( layer.kind == "LayerKind.SMARTOBJECT"){
    isSmObj = true;
    getTheSMScale();
}
var layerWidth = layer.bounds[2].value - layer.bounds[0].value;
var relUpperCenterX = layerWidth / 2;
//Calculate length and width based on the rectangular bounds of the selected layer
var idsetd = charIDToTypeID( "setd" );
    var desc2045 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1289 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref1289.putProperty( idChnl, idfsel );
    desc2045.putReference( idnull, ref1289 );
    var idT = charIDToTypeID( "T   " );
        var ref1290 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idChnl = charIDToTypeID( "Chnl" );
        var idTrsp = charIDToTypeID( "Trsp" );
        ref1290.putEnumerated( idChnl, idChnl, idTrsp );
    desc2045.putReference( idT, ref1290 );
executeAction( idsetd, desc2045, DialogModes.NO );


// =======================================================
var idDplc = charIDToTypeID( "Dplc" );
    var desc2046 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1291 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref1291.putProperty( idChnl, idfsel );
    desc2046.putReference( idnull, ref1291 );
    var idNm = charIDToTypeID( "Nm  " );
    desc2046.putString( idNm, """working""" );
executeAction( idDplc, desc2046, DialogModes.NO );


// =======================================================
var idsetdd = charIDToTypeID( "setd" );
    var desc2047 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1292 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref1292.putProperty( idChnl, idfsel );
    desc2047.putReference( idnull, ref1292 );
    var idT = charIDToTypeID( "T   " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idNone = charIDToTypeID( "None" );
    desc2047.putEnumerated( idT, idOrdn, idNone );
executeAction( idsetdd, desc2047, DialogModes.NO );


    //Create a text layer
    var textLayer = activeDocument.artLayers.add(); //Make a new layer on the canvas
    textLayer.kind = LayerKind.TEXT; //Make that layer a text layer
    textLayer.name = layer.name; //Name the layer "Dimensions"
var red = new SolidColor();
    red.rgb.red = 255;
red.rgb.green = 0;
    red.rgb.blue = 0;    
    var textReference = textLayer.textItem; //Create a textItem which we'll use to fill the text layer
    textReference.contents =isSmObj==true? (layer.name + " scaled as w:"+SMObjScales.w+ "%  and h:"+SMObjScales.h+"%") :layer.name //Set the contents of that textItem to the length and width
textReference.color = red;
textReference.size = 40;
textReference.position[0] = Array (Math.floor(0, relUpperCenterX));

var idsetd2 = charIDToTypeID( "setd" );
    var desc2051 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1295 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref1295.putProperty( idChnl, idfsel );
    desc2051.putReference( idnull, ref1295 );
    var idT = charIDToTypeID( "T   " );
        var ref1296 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        ref1296.putName( idChnl, "working" );
    desc2051.putReference( idT, ref1296 );
executeAction( idsetd2, desc2051, DialogModes.NO );


// =======================================================
var idAlgn1 = charIDToTypeID( "Algn" );
    var desc2071 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1313 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1313.putEnumerated( idLyr, idOrdn, idTrgt );
    desc2071.putReference( idnull, ref1313 );
    var idUsng = charIDToTypeID( "Usng" );
    var idADSt = charIDToTypeID( "ADSt" );
    var idAdCH = charIDToTypeID( "AdCH" );
    desc2071.putEnumerated( idUsng, idADSt, idAdCH );
executeAction( idAlgn1, desc2071, DialogModes.NO );


// =======================================================
var idAlgn2 = charIDToTypeID( "Algn" );
    var desc2072 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1314 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1314.putEnumerated( idLyr, idOrdn, idTrgt );
    desc2072.putReference( idnull, ref1314 );
    var idUsng = charIDToTypeID( "Usng" );
    var idADSt = charIDToTypeID( "ADSt" );
    var idAdTp = charIDToTypeID( "AdTp" );
    desc2072.putEnumerated( idUsng, idADSt, idAdTp );
executeAction( idAlgn2, desc2072, DialogModes.NO );


// =======================================================
var idsetd3 = charIDToTypeID( "setd" );
    var desc2073 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1315 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idfsel = charIDToTypeID( "fsel" );
        ref1315.putProperty( idChnl, idfsel );
    desc2073.putReference( idnull, ref1315 );
    var idT = charIDToTypeID( "T   " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idNone = charIDToTypeID( "None" );
    desc2073.putEnumerated( idT, idOrdn, idNone );
executeAction( idsetd3, desc2073, DialogModes.NO );


// =======================================================
var idmove = charIDToTypeID( "move" );
    var desc2074 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1316 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1316.putEnumerated( idLyr, idOrdn, idTrgt );
    desc2074.putReference( idnull, ref1316 );
    var idT = charIDToTypeID( "T   " );
        var desc2075 = new ActionDescriptor();
        var idHrzn = charIDToTypeID( "Hrzn" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc2075.putUnitDouble( idHrzn, idRlt, 0.000000 );
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc2075.putUnitDouble( idVrtc, idRlt, -50.000000 );
    var idOfst = charIDToTypeID( "Ofst" );
    desc2074.putObject( idT, idOfst, desc2075 );
executeAction( idmove, desc2074, DialogModes.NO );


// =======================================================
var idslct1 = charIDToTypeID( "slct" );
    var desc2077 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1318 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        ref1318.putName( idChnl, "working" );
    desc2077.putReference( idnull, ref1318 );
executeAction( idslct1, desc2077, DialogModes.NO );


// =======================================================
var idDlt2 = charIDToTypeID( "Dlt " );
    var desc2078 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref1319 = new ActionReference();
        var idChnl = charIDToTypeID( "Chnl" );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref1319.putEnumerated( idChnl, idOrdn, idTrgt );
    desc2078.putReference( idnull, ref1319 );
executeAction( idDlt2, desc2078, DialogModes.NO );
}

function  getTheSMScale(){

    var theActvTrnsFile = new File(File($.fileName).path +"/~activateTransf.jsx");
    // =======================================================
    var idAdobeScriptAutomationScripts = stringIDToTypeID( "AdobeScriptAutomation Scripts" );
        var desc510 = new ActionDescriptor();
        var idjsCt = charIDToTypeID( "jsCt" );
        desc510.putPath( idjsCt, theActvTrnsFile );
        var idjsMs = charIDToTypeID( "jsMs" );
        desc510.putString( idjsMs, """true""" );
    executeAction( idAdobeScriptAutomationScripts, desc510, DialogModes.NO );
}
function hasBackground(){// function to check if there is a background layer
    var res = undefined;
    try{
        var ref = new ActionReference();
        ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID("Nm  ")); 
        ref.putIndex( charIDToTypeID("Lyr "), 0 );
        executeActionGet(ref).getString(charIDToTypeID("Nm  ") ); 
        res = true;
    }catch(e){ res = false}
    return res;
}

function getSelectedLayersIdx(){// get the selected layers index( positon in layer editor)
     var selectedLayers = new Array;
     var ref = new ActionReference();
     ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
     var desc = executeActionGet(ref);
     var add = 1;
     if(hasBackground()){add = 0}
     if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
          desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
          var c = desc.count 
          var selectedLayers = new Array();
          for(var i=0;i<c;i++){
               selectedLayers.push(  (desc.getReference( i ).getIndex()) + add);
          }
     }else{
          var ref = new ActionReference(); 
          ref.putProperty( charIDToTypeID('Prpr') , charIDToTypeID( 'ItmI' )); 
          ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
          srs = hasBackground()?executeActionGet(ref).getInteger(charIDToTypeID( 'ItmI' ))-1:executeActionGet(ref).getInteger(charIDToTypeID( 'ItmI' ));
          selectedLayers.push( srs);
     }
     return selectedLayers;
}
function multiSelectByIDx(idx) {
  if( idx.constructor != Array ) idx = [ idx ];
    var layers = new Array();
    var id54 = charIDToTypeID( "slct" );
    var desc12 = new ActionDescriptor();
    var id55 = charIDToTypeID( "null" );
    var ref9 = new ActionReference();
    for (var i = 0; i < idx.length; i++) {
          layers[i] = charIDToTypeID( "Lyr " );
          ref9.putIndex(layers[i], idx[i]);
    }
    desc12.putReference( id55, ref9 );
    var id58 = charIDToTypeID( "MkVs" );
    desc12.putBoolean( id58, false );
    executeAction( id54, desc12, DialogModes.NO );
}
