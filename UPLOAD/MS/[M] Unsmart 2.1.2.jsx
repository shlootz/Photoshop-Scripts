/**
* @@@BUILDINFO@@@ [M] Unsmart 2.1.2.jsx Tue Dec 19 2017 20:01:54 GMT+0100
*/

/*
    <javascriptresource>
    <name>[M] Unsmart 2.1.2</name>
    <enableinfo>true</enableinfo>
    <category>Magic</category>
    </javascriptresource>
*/

#target Photoshop
#include Lexicon-0.1.jsxinc

////////////////////////////////////
// 		SETTINGS 
////////////////////////////////////

var settings = {
		deleteOriginalObject: true, // Smart object is hidden if false. 
		scaleAllLayerEffects: true, // Only if smart object has another size than its content. Size must be proportional.
		resizeContent: true, // Scale extracted content. Only widht and height.
		preserveSmartObjectProperties: true, // Creates group from content if true. Group will have vector mask, style, blending of smart object. Bitmap mask hides overleaping pixels.
		clearSmartObjectContent: true, // Delete hidden layers inside smart object
		hidePixelsOutsideSoCanvas: true, // Option not fix pixels outside smart object canvas. Creates always bitmap mask on group. "preserveSmartObjectProperties" must be set to true
		dontGroupSOContent: false,
		styleScaleSettings:{
			scaleStyle: true,
			scaleShapeStrokeWidth: true,
			scaleShapePatternFill: true,
			scaleShapeGradientFill: true, //only if gradient is not aligned with layer
			scaleShapeStrokeGradient: true, //only if gradient is not aligned with layer
			scaleShapeStrokePattern: true
		}
	}

/*
	
	LICENSE
    =======
    This code is provided as is without warranty. The author assumes no responsibility for any inconvenience. 
    
    Allowed:
    - You may use for commercial and non-commercial purposes without limitations
    - You may copy and distribute the script without restrictions
    - You may include this code in your non-commercial software projects
    - You may modify this script and share if you keep this license
    
    Prohibited
    - You may NOT selling this script without author's permission
    - You may NOT without author's permission using this script as part of software which you want monetize
    - You may NOT distribute script WITHOUT this license informations
    
	
	Copyright: © 2017 Jaroslav Bereza - http://bereza.cz
	If you are interested in how the code works, write me at j@bereza.cz  I am open to cooperation.
    
    KNOWN ISSUES
    ============
	- some deformations can't be reproduced with text layers or smart object vector layers. Nearest similar deformation is used.
	- you might see different result if smart object has more layer comps but none is selected
	- documents may not have compatible modes e.g. bits per pixels, color mode, pixel scaling
	
	
	Version History:
	==================
	2.1.2:
	- fixed LayerContext reinitialization in lexicon library. Out of range bug.
	- fixed bug when effects scaling might leads to changes layers inside instead group for SO
	- fixed faster layer moving method. Now translate layer method uses different method independent on DPI
	- improved - artboard settings is now restored from PS document setttings. Not script default settings.
	- fixed folder collapsing when styles of SO content was scaled. Now it remains collapsed.
	2.1.1:
	- fixed faster layer moving method. Now are offset values divided by document resolution ratio
	2.1:
	- improved performance (up to 3×) for moving undeformed layer to desired position
	- fixed ignoring for vector smart objects
	- better expanded SO groups collapsing. Removed option for enable/disable because performance issue was solved.
	- code cleaning
	2.0.1:
	- fixed wrong masterDocument size detection
	- fixed script name in Photoshop
	2.0:
	- completely rewritten
	- removed JAM library
	- added viewless method
	- opening and closing SO window only once if there is multiple instances
	- better active SO composition detection
	- Unsmart can now reproduce more deformations methods
	- big performance improvements
	- many more
	1.1:
	- added collapse all groups before extracting smart object content. Keeps layer panel clear.
	- added option not fix pixels outside smart object canvas
	1.0:
	- Initial release.
	
*/    

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Do not look down here. If you try to understand my code, you will waste a lot of time.
////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.bringToFront();
cTID = function(s) { return cTID[s] || (cTID[s] = charIDToTypeID(s)); };
sTID = function(s) { return sTID[s] || (sTID[s] = stringIDToTypeID(s)); }; 

var startDisplayDialogs = app.displayDialogs;
app.displayDialogs = DialogModes.NO;

var docMaster = app.activeDocument;

///////////////////
// MAIN CODE
///////////////////
applyPollyFills();

if(docMaster.length != 0) {  
	if(app.version.split(".")[0] >= 17){
		//main(); // uncoment for debug	
		app.activeDocument.suspendHistory("Unsmart", "main()"); //keep history clear
	}
	else{
		alert("Sorry. Only Photoshop 2015.5 and higher is supported.");
	}
}

function main(){	
	var artboardsSettings = getArtboardSettings();
	preventFromArtboardMessUp();
	
	//global variables
	var layerList = lx.getSelectedLayersId ();
	layerList = filterValidLayers(layerList);
	var soGroupList = new Array();
	var clippedLayers = new Array();
	var openWindowID;
	var documentOpened;
	var exceededWarningShown = false;
	var tempFilesToRemove = new Array();
	var resolutionRatio = lx.getDocumentDescriptor(null, null, "resolution").getValue("resolution") / 72.00;
	var effectsScaled = false;
	
	// we don't want transform path, bug layer
	if(isPathSelected()){ //performance condition
		deselectPath ();
	}
	
	// we don't want open and close window for each SO instance
	// we also don't want change layer comp for each SO instance if instance has same layer comp
	// so we sort smart object instances like this: soInst > comps > soLayerIDs > descriptor
	var soInst = getSOInstances(layerList);
	
	for (var soKey in soInst){
		var comps = soInst[soKey];
		openWindowID = null;
		
		for (var compKey in comps){
			var layers = comps[compKey];
			
			for (var layerKey in layers){
				var desc = layers[layerKey];
				lx.selectLayers(layerKey,"id");
				var layerStack = new LayerContextStack();
				
				// ingore SO inside locked group
				if(layerStack.hasParentProtectAll(layerStack.getLast())) {
					var indexInArrayToRemove = layerList.findValueIndex(layerKey);
					layerList.splice(indexInArrayToRemove, 1);
					continue;
				}
				
				// this should include blending mode, fill, opacity
				if(canCopyPasteStyle(desc)){
					copyLayerStyle ();
				}
				
				// we want move clipped layer from SO to new group
				clippedLayers = getClippedLayersList(desc);
				
				// window method is used if smart object has layer comps
				if(comps.windowMethod){
					extractWithWindow(desc, soKey);
				}else{
					extractViewless(desc, soKey);
				}
			}
		}
		
		if(documentOpened){
			// we can't close document by ID... so we first select this document
			selectDocument(openWindowID);
			closeWindow(openWindowID);
		}
	
		openWindowID = undefined;
		documentOpened = undefined;
		
	}

	// clean up unsmarted objects
	lx.forEachLayerWithSelection(layerList, "id", function(soId){
		if(settings.deleteOriginalObject){
			lx.deleteLayers(soId, "id");
		}else{
			hideLayer();
			setColorTag(null,null,"Gry ");
		}
	});
	
	// restore layer selection but with unsmarted objects
	if(soGroupList.length > 0){
		lx.selectLayers(soGroupList, "id");
		if(settings.dontGroupSOContent){
			ungroupSelectedLayer();
		}
	}
	
	// clean up .psb files in temp folder
	lx.forEach(tempFilesToRemove, null, function (file){
		if(file.exists){
			file.remove();
		}
	});

	revertArtboardsSettings();
	
	/////////////
	// FUNCTIONS
	/////////////

	function extractViewless(desc, soKey){
		var smartObject = desc.getObjectValue(stringIDToTypeID('smartObject'));
		
		var hasPath = smartObject.hasKey(stringIDToTypeID('link'));
		var isKnownPath = soInst[soKey].file;
		var isCloudFile = hasPath && smartObject.getType(stringIDToTypeID('link')) == "DescValueType.OBJECTTYPE";
		var file;
		
		if((!hasPath && !isKnownPath) || (isCloudFile && !isKnownPath)){
			if(isCloudFile){
				file = new File(getCloudFilePath(desc));
				//executeAction( stringIDToTypeID( "placedLayerConvertToEmbedded" ), undefined, DialogModes.NO );
			}else{
				var extension = smartObject.getString(stringIDToTypeID('fileReference')).split(".").pop();
				file = convertToLinkedSo(soKey+"."+extension);
				tempFilesToRemove.push(file);
			}
		}else if(isKnownPath){
			file = soInst[soKey].file; 
		}else{
			file = new File(smartObject.getPath(stringIDToTypeID('link')));
		}
	
		soInst[soKey].file = file;
		
		/*clean these variables*/
		var soMore = desc.getObjectValue(stringIDToTypeID('smartObjectMore'));
		var soInnerWidth = soMore.getObjectValue(stringIDToTypeID('size')).getDouble(stringIDToTypeID('width'));
		var soInnerHeight = soMore.getObjectValue(stringIDToTypeID('size')).getDouble(stringIDToTypeID('height'));
		var widthDeviation = soInnerWidth % 2;
		var heightDeviation = soInnerHeight % 2;
		
		selectPixels(0 + widthDeviation, 0 + heightDeviation, soInnerWidth, soInnerHeight);
		placeUnwrap(file);
		deselectPixels();
		
		unlockAllLocks(); //all SO layers must be selected. Native function for folder ignores groups in CC 2017 and lower
		
		extractShared(desc, true);
	}


	function extractWithWindow(desc, soKey){
		var soCompId = desc.getObjectValue(stringIDToTypeID('smartObjectMore')).getInteger(stringIDToTypeID('comp'));
		
		
		// first check if document was already opened with script, so we can skip some things
		if(documentOpened && openWindowID){
			selectDocument(openWindowID);
		}else{        
			var documentsBefore = app.documents.length;
			executeAction( stringIDToTypeID( "placedLayerEditContents" ), new ActionDescriptor(), DialogModes.NO );
			// we need to be sure that correct document is opened so we will wait
			WaitForRedraw ();
			
			selectAllLayers ();
			
			// we want layers locking untouched after script execution
			if(!hasHistorySnapshot("UnsmartSnapshot")){
 				makeHistorySnapshot ("UnsmartSnapshot");
			}
			
			var documentsAfter = app.documents.length;
			// here we know if script opened window, so we will not close windows opened before script execution
			documentOpened = documentsBefore === (documentsAfter - 1);
			
			unlockEverything();
		}
	
		var compActive = getActiveComp(getLayerCompsData()); // this variable could be more global
		var docSO = app.activeDocument;
		openWindowID = docSO.id;
		
		if(soCompId !== compActive){
			if(soCompId === -1){
				soCompId = compActive;
			}
			changeComp(soCompId); 
		}
		
		if(settings.clearSmartObjectContent){
			try{
				deleteHiddenLayers();
			}catch(e){;}//error if nothing to delete
		}
		
		// check if we don't exceed nesting limit
		var documentDeepestLevel = lx.getDocumentDeepestLevel();
		var soCurrentLevel = layerStack.stack.length+1;
		var isNestingLevelExceeded = (documentDeepestLevel + soCurrentLevel) > 11;
		if(isNestingLevelExceeded){
			if(!exceededWarningShown){
				alert("Some layer(s) will be skipped. Limit is 10 nested groups/artboards + 1 layer.\nYour smart object is in level: "+soCurrentLevel + "\nDeepest level in smart object is: "+documentDeepestLevel+"\nYou need remove: "+(documentDeepestLevel + soCurrentLevel - 11)+" level(s)");
			}
			exceededWarningShown = true;
			//don't delete layer if layer is not unsmarted
			var indexInArrayToRemove = layerList.findValueIndex(layerKey);
			layerList.splice(indexInArrayToRemove, 1);
			if(hasHistorySnapshot("UnsmartSnapshot")){
				restoreFromSnapshot ("UnsmartSnapshot");
			}
			selectDocument (docMaster.id);
		}else{
			duplicateToDocument (docMaster.id);
			if(hasHistorySnapshot("UnsmartSnapshot")){ //this could be executed only if layer comp has changed
				restoreFromSnapshot ("UnsmartSnapshot");
			}
			selectDocument (docMaster.id);
			extractShared(desc, false);
		}
	} 

	function extractShared(desc, isViewLess){
		var soMore = desc.getObjectValue(stringIDToTypeID('smartObjectMore'));
		var soInnerWidth = soMore.getObjectValue(stringIDToTypeID('size')).getDouble(stringIDToTypeID('width'));
		var soInnerHeight = soMore.getObjectValue(stringIDToTypeID('size')).getDouble(stringIDToTypeID('height'));
		var soNonAffineTransform = soMore.getList(stringIDToTypeID('nonAffineTransform'));
		var soId = desc.getInteger(stringIDToTypeID('layerID'));
		var soIndex = lx.convertLayerIdToIndex(soId);
		
		
		
		lx.createGroup ();
		var groupForSo = docMaster.activeLayer;
		var groupForSoLayerContext = new LayerContext();
		soGroupList.push(groupForSo.id);
		
		// Fix Big SO which are bigger than canvas
		if(isViewLess){
			// so content doesn't start at 0,0 of selection if is bigger than document and viewless
			// first must be created group and this cause that selected is only group and this eliminate risk that we will transform path instead layer
			var docMasterWidth = lx.getDocumentDescriptor(null, null, "width").getValue("width") * resolutionRatio;
			var docMasterHeight = lx.getDocumentDescriptor(null, null, "height").getValue("height") * resolutionRatio;
			
			if(docMasterWidth < soInnerWidth || docMasterHeight < soInnerHeight){
				var x = (docMasterWidth < soInnerWidth) ? (soInnerWidth-docMasterWidth)/2 : 0;
				var y = (docMasterHeight < soInnerHeight) ? (soInnerHeight-docMasterHeight)/2 : 0;
				translate(x,y);
			}
		}
	
		// Set layer order for viewless if needed
		// if group end has +1 than desired index then it already has desired position so it would throw error
		if(/*isViewLess && */soIndex !== (groupForSo.itemIndex - groupForSoLayerContext.deepLengthAbsolute - 1)){
			moveLayerOrder(soIndex, groupForSo.id);
		}
		
		// viewLess method needs different method for removing hidden layers
		if(isViewLess && settings.clearSmartObjectContent){
			clearSOContentInParentDoc(groupForSo.id);
		}
		
		// if smart object content has layers outside canvas, we can hide them with mask on unsmarted group
		if(settings.hidePixelsOutsideSoCanvas){
			var left = 0, top = 0;
			
			var soBounds = {
				top:top,
				right:left + soInnerWidth,
				bottom:top + soInnerHeight,
				left:left
			};
		
			var shouldHaveMask = isSOContentOutsideCanvas(groupForSo.id, soBounds);
			if(shouldHaveMask){
				selectPixels(left, top, soInnerWidth, soInnerHeight);
				createMask ();
			}
		}
		
		// here we move layer to desired position and apply deformation
		
		var soConerPoints = cornersActionListToObject(soNonAffineTransform);
		var boolIsSmartObjectDeformed = isSmartObjectDeformed(soConerPoints, soInnerWidth, soInnerHeight);
		
		if(settings.resizeContent && boolIsSmartObjectDeformed){
			doRectangleToQuadrilateral (soInnerWidth, soInnerHeight, soConerPoints);
			if(settings.scaleAllLayerEffects){
				var trScaleRatio = calculateScaleRatio(soInnerWidth, soInnerHeight, soNonAffineTransform);
				// only if ratio is not 100,00
				if((Math.round(trScaleRatio*100)/100) !== 100){
					groupForSoLayerContext.reinit(); // reinitialize because we removed hidden layer and moved group to the bottom
					var groupContentIndexes = groupForSoLayerContext.getContentPointers(null,true);
					scaleSelectedLayersStyle(trScaleRatio,groupContentIndexes);
					effectsScaled = true;
				}
			}
		}else{
			translate( soConerPoints.leftTop.x, soConerPoints.leftTop.y );
		}
		
		if(settings.preserveSmartObjectProperties && !settings.dontGroupSOContent){
			var hasMask = desc.getBoolean(stringIDToTypeID('hasUserMask'));
			var hasVectorMask = desc.getBoolean(stringIDToTypeID('hasVectorMask'));
			var isVisible = desc.getBoolean(stringIDToTypeID('visible'));
			var hasLinkedLayers = desc.hasKey(stringIDToTypeID('linkedLayerIDs'));
			var colorTag = desc.getEnumerationValue(stringIDToTypeID('color'));
			var hasCustomColorTag = typeIDToStringID(colorTag) !== "none";
			
			// performance condition
			if(effectsScaled){
				lx.selectLayers (groupForSo.id, "id");
			}
			collapseFolder();
			renameLayer(groupForSo.id, desc.getString(stringIDToTypeID('name')));
			
			if(hasCustomColorTag){
				setColorTag(groupForSo.id, "id",colorTag);
			}
			
			if(canCopyPasteStyle (desc)){
				pasteLayerStyle ();
			}
		
			if(!isVisible){ //performance condition
				groupForSo.visible = false;
			}
		
			if(!settings.hidePixelsOutsideSoCanvas && hasMask){
				duplicateMask(soId,groupForSo.id);
				var userMaskEnabled = desc.getBoolean(stringIDToTypeID('userMaskEnabled'));
				if(!userMaskEnabled){
					disableMask (groupForSo.id);
				}
			}
		
			if(hasVectorMask){
				duplicateVectorMask(soId,groupForSo.id);
				lx.selectLayers (soId, "id");
				var vectorMaskEnabled = isVectorMaskEnabled ();
				// if has vector mask but mask is disabled
				if(!vectorMaskEnabled ){
					disableVectorMask (groupForSo.id);
				}
			}
		
			moveAllClippedLayers(groupForSo);
			
			if(hasLinkedLayers){
				linkLinkedLayers(desc,groupForSo);
			}
		}
	}
	

	///////////////////////////////
	// FUNCTIONS CALLED FROM MAIN
	///////////////////////////////

	function linkLinkedLayers(desc,groupForSo){
		lx.selectLayers(desc.getInteger(stringIDToTypeID('layerID')), "id");
		var isLinkEnabled = isLinkOnLayerEnabled();
		
		var links = desc.getList(stringIDToTypeID('linkedLayerIDs'));
		var linkID = links.getInteger(0);
		var groupID = groupForSo.id;
		lx.selectLayers([linkID,groupID], "id"); 
		
		var desc2111 = new LxActionDescriptor();
		desc2111.lxRefLayer();
		executeAction( "linkSelectedLayers", desc2111 );
		
		if(!isLinkEnabled){
		   var iddisableLayerLink = stringIDToTypeID( "disableLayerLink" );
				var desc2202 = new LxActionDescriptor();
				desc2202.lxRefLayer(groupID, "id");
				var idT = charIDToTypeID( "T   " );
					var desc2203 = new ActionDescriptor();
					var idlnkE = charIDToTypeID( "lnkE" );
					desc2203.putBoolean( idlnkE, false );
				var idLyr = charIDToTypeID( "Lyr " );
				desc2202.putObject( idT, idLyr, desc2203 );
			executeAction( iddisableLayerLink, desc2202, DialogModes.NO );
		}
	}

	//
	// otevře SO
	function openSO(){
		var idplacedLayerEditContents = sTID( "placedLayerEditContents" );
		var desc187 = new ActionDescriptor();
		executeAction( idplacedLayerEditContents, desc187, DialogModes.NO );
	}
	
	function placeUnwrap(file){
		try{
			var desc118 = new ActionDescriptor();
			desc118.putPath( charIDToTypeID( "null" ) , file );       
			desc118.putBoolean(stringIDToTypeID("unwrapLayers"), true);
			executeAction( charIDToTypeID( "Plc " ), desc118, DialogModes.NO );
		}catch(e){ 
			undo(); //undo pouze při speciální chybovém kodu TODO
			throw "Unable to UnSmart object. Check your group nesting levels. Limit is 10. Also check your document color mode."
		}
	}

	function isLinkOnLayerEnabled(){
		try{
			var idslct = charIDToTypeID( "slct" );
				var desc135 = new ActionDescriptor();
				var idnull = charIDToTypeID( "null" );
					var ref63 = new ActionReference();
					var idMn = charIDToTypeID( "Mn  " );
					var idMnIt = charIDToTypeID( "MnIt" );
					var idplacedLayerEditContents = stringIDToTypeID( "selectLinkedLayers" );
					ref63.putEnumerated( idMn, idMnIt, idplacedLayerEditContents );
				desc135.putReference( idnull, ref63 );
			executeAction( idslct, desc135, DialogModes.NO );
			return true;
		}catch(e){
			if(e.number == -25920){ // menu item not available
				return false;
			}
			throw e;
		}
	}

	
	//
	// changes comp inside smart object
	function changeComp(id){
		if(id===0){
			try{
			var idresetFromComp = stringIDToTypeID( "resetFromComp" );
			var desc2707 = new ActionDescriptor();
			executeAction( idresetFromComp, desc2707, DialogModes.NO );
			}catch(e){}//you cant reset comp if last document state is equal to current comp
		}else{
			var idapplyComp = sTID( "applyComp" );
				var desc189 = new ActionDescriptor();
				var idnull = cTID( "null" );
					var ref97 = new ActionReference();
					var idcompsClass = sTID( "compsClass" );
					ref97.putIdentifier( idcompsClass, id );
				desc189.putReference( idnull, ref97 );
			executeAction( idapplyComp, desc189, DialogModes.NO );
		}
	}

	function isInLockedFolder(layer){
		
		while(layer.parent.typename != "Document"){
			layer = layer.parent;
			if(layer.allLocked){
				return true;
			}
		}
		return false;
	}

	function hasHistorySnapshot(snapshotName){
		try{
			var ref = new ActionReference();
			var idSnpS = charIDToTypeID( "SnpS" );
			ref.putName( idSnpS, snapshotName );
			executeActionGet( ref );		
			return true;
		}catch(e){
			return false;
		}
	}

	// IDs
	function getClippedLayersList(soDesc){
		var result = new Array();
		// we need fresh soIndex so we take ID and look for new updated index
		var soIndex = lx.convertLayerIdToIndex(soDesc.getInteger(stringIDToTypeID('layerID')));
		var limitLayers = soDesc.getInteger(stringIDToTypeID('count'));
		var bgCounter = 0;
		try {
			var dummy = docMaster.backgroundLayer;
			bgCounter=1;
		}catch(e){} //do nothing
		
		for(soIndex; soIndex <= limitLayers /*break inside*/; soIndex++){
			var testedLayerDesc = lx.getLayerDescriptor (soIndex-bgCounter);
			var isClipped = testedLayerDesc.getBoolean(stringIDToTypeID('group'));
			var fromID = testedLayerDesc.getInteger(stringIDToTypeID('layerID'));
			if(!isClipped){break}
			result.push(fromID)
		}
		return result;
	}

	function moveAllClippedLayers(layerSet){
		var layerSetIndex = getLayerDescriptorByID(layerSet.id).getInteger(stringIDToTypeID('itemIndex'));
		
		for(var i = clippedLayers.length-1, j=0; i >= 0; i--){
			var fromID = clippedLayers[i];
			var idmove = charIDToTypeID( "move" );
				var desc102 = new ActionDescriptor();
				var idnull = charIDToTypeID( "null" );
					var ref60 = new ActionReference();
					var idLyr = charIDToTypeID( "Lyr " );
					ref60.putIdentifier( idLyr, fromID );
					
				desc102.putReference( idnull, ref60 );
				var idT = charIDToTypeID( "T   " );
					var ref61 = new ActionReference();
					ref61.putIndex( idLyr, layerSetIndex ); //global variable
				desc102.putReference( idT, ref61 );
				var idAdjs = charIDToTypeID( "Adjs" );
				desc102.putBoolean( idAdjs, false );
				var idVrsn = charIDToTypeID( "Vrsn" );
				desc102.putInteger( idVrsn, 5 );
				
			executeAction( idmove, desc102, DialogModes.NO );
			
			//because layer paste between layer and clipped layer is clipped by default
			if(j===0){
				var idGrpL = charIDToTypeID( "GrpL" );
					var desc104 = new ActionDescriptor();
					desc104.putReference( idnull, ref60 );
				executeAction( idGrpL, desc104, DialogModes.NO );
			}
			j++;
		}
	}

	function unlockEverything(){
		if(lx.existsBackgroundLayer()){
			unlockBackground();
		}
		unlockAllLocks();

		function unlockBackground() {
		var idsetd = cTID( "setd" );
			var desc1675 = new ActionDescriptor();
				var ref1104 = new ActionReference();
				ref1104.putProperty(  cTID('Lyr '),  cTID('Bckg'));
			desc1675.putReference( cTID('null'), ref1104 );
				var desc1676 = new ActionDescriptor();
				desc1676.putUnitDouble(  cTID('Opct'),  cTID('#Prc'), 100.000000 );
				desc1676.putEnumerated(  cTID('Md  '),  cTID('BlnM'),  cTID('Nrml'));
			var idLyr = cTID( "Lyr " );
			desc1675.putObject( cTID('T   '), cTID('Lyr '), desc1676 );
			desc1675.putInteger( cTID('LyrI'), 7 );
		executeAction( idsetd, desc1675, DialogModes.NO );
		}
	}

	function getLayerDescriptorByID(id){
		var ref = new ActionReference();  
		ref.putIdentifier( cTID( "Lyr " ), id );    
		var desc = executeActionGet(ref); 
		return desc;
	}

	function getSOInstances(listID){
		var so = {};

		for(var i = 0, len = listID.length; i < len; i++){
			var desc = getLayerDescriptorByID(listID[i]);
			var soID = desc.getObjectValue(stringIDToTypeID('smartObjectMore')).getString(stringIDToTypeID('ID'));
			var compID = desc.getObjectValue(stringIDToTypeID('smartObjectMore')).getInteger(stringIDToTypeID('comp'));
			var hasComps = desc.getObjectValue(stringIDToTypeID('smartObject')).getObjectValue(stringIDToTypeID('compsList')).hasKey(stringIDToTypeID('compList'))
			
			var layerID = listID[i].toString();
			so[soID] ? null : so[soID] = new Object();
			so[soID].windowMethod = hasComps;
			so[soID][compID] ? null : so[soID][compID] = new Object();
			so[soID][compID][layerID] = desc;
		}

		return so;
	}

	function unlockAllLocks() {
		var idsetd = cTID( "setd" );
		var desc50 = new ActionDescriptor();
		var idnull = cTID( "null" );
			var ref28 = new ActionReference();
			ref28.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
		desc50.putReference( idnull, ref28 );
		var idT = cTID( "T   " );
			var desc51 = new ActionDescriptor();
			var idlayerLocking = sTID( "layerLocking" );
				var desc52 = new ActionDescriptor();
				var idprotectNone = sTID( "protectNone" );
				desc52.putBoolean( idprotectNone, true );
			var idlayerLocking = sTID( "layerLocking" );
			desc51.putObject( idlayerLocking, idlayerLocking, desc52 );
		var idLyr = cTID( "Lyr " );
		desc50.putObject( idT, idLyr, desc51 );
	executeAction( idsetd, desc50, DialogModes.NO );
	}

	function deleteHiddenLayers(){
		var idDlt = cTID( "Dlt " );
			var desc213 = new ActionDescriptor();
			var idnull = cTID( "null" );
				var ref110 = new ActionReference();
				var idLyr = cTID( "Lyr " );
				var idOrdn = cTID( "Ordn" );
				var idhidden = sTID( "hidden" );
				ref110.putEnumerated( idLyr, idOrdn, idhidden );
			desc213.putReference( idnull, ref110 );
		executeAction( idDlt, desc213, DialogModes.NO );
	}

	function selectAllLayers() {
		var ref = new ActionReference();
		ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
		var desc = new ActionDescriptor();
		desc.putReference(cTID('null'), ref);
	executeAction(sTID('selectAllLayers'), desc, DialogModes.NO);
	}
	
	function convertToLinkedSo(filename){
		var file = new File(Folder.temp+"/"+filename);
		
		var idplacedLayerConvertToLinked = stringIDToTypeID( "placedLayerConvertToLinked" );
			var desc78 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref46 = new ActionReference();
				var idLyr = charIDToTypeID( "Lyr " );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idTrgt = charIDToTypeID( "Trgt" );
				ref46.putEnumerated( idLyr, idOrdn, idTrgt );
			desc78.putReference( idnull, ref46 );
			var idUsng = charIDToTypeID( "Usng" );
			desc78.putPath( idUsng, file );
		executeAction( idplacedLayerConvertToLinked, desc78, DialogModes.NO );
		
		return file;
	}

	
	function duplicateToDocument(documentID){
		try{
			var idDplc = cTID( "Dplc" );
				var desc231 = new ActionDescriptor();
				var idnull = cTID( "null" );
					var ref121 = new ActionReference();
					var idLyr = cTID( "Lyr " );
					var idOrdn = cTID( "Ordn" );
					var idTrgt = cTID( "Trgt" );
					ref121.putEnumerated( idLyr, idOrdn, idTrgt );
				desc231.putReference( idnull, ref121 );
				var idT = cTID( "T   " );
					var ref122 = new ActionReference();
					var idDcmn = cTID( "Dcmn" );
					ref122.putIdentifier( idDcmn, documentID );
				desc231.putReference( idT, ref122 );
				var idIdnt = cTID( "Idnt" );
			executeAction( idDplc, desc231, DialogModes.NO );
		}
		catch(e){
				alert("Can't duplicate content")
		}
	}

	function isSOContentOutsideCanvas(layerID, soBounds){
		
		var index = lx.convertLayerIdToIndex(layerID);
		var groupID = stringIDToTypeID('group');
		var sectionID = stringIDToTypeID('layerSection');
		var endID = stringIDToTypeID('layerSectionEnd');
		var startID = stringIDToTypeID('layerSectionStart');
		var boundsID = stringIDToTypeID('bounds');
		var leftID = stringIDToTypeID('left');
		var rightID = stringIDToTypeID('right');
		var topID = stringIDToTypeID('top');
		var bottomID = stringIDToTypeID('bottom');

		for(var i = index-1, level=0; level >= 0 ; i--){
			var desc = lx.getLayerDescriptor(i);
			var clipped = desc.getBoolean(groupID);
			
			if(clipped){continue;}
			
			var layerSection = desc.getEnumerationValue(sectionID);
			if(layerSection === startID){
				level++
			}
			else if(layerSection === endID){
				level--
			}
			else{
				var bounds = desc.getObjectValue(boundsID);
			   
				var isOutside = (
					soBounds.left > bounds.getUnitDoubleValue(leftID) ||
					soBounds.top > bounds.getUnitDoubleValue(topID) ||
					soBounds.right < bounds.getUnitDoubleValue(rightID) ||
					soBounds.bottom < bounds.getUnitDoubleValue(bottomID)
				);
				if(isOutside){
					return true;
				}
			}
			return false;
		}
	}

	function clearSOContentInParentDoc(layerID){
		
		var index = lx.convertLayerIdToIndex(layerID);
		var deleteList = new Array();
		var sectionID = stringIDToTypeID('layerSection');
		var endID = stringIDToTypeID('layerSectionEnd');
		var startID = stringIDToTypeID('layerSectionStart');
		var visibleID = stringIDToTypeID('visible');

		for(var i = index-1, level=0; level >= 0 ; i--){
			var desc = lx.getLayerDescriptor(i);
			var visible = desc.getBoolean(visibleID);
			
			if(!visible){
				deleteList.push(lx.convertLayerIndexToId(i));
			}
			
			var layerSection = desc.getEnumerationValue(sectionID);
			if(layerSection===startID){
				level++
			}
			else if(layerSection===endID){
				level--
			}
		}
	
		for(var i = deleteList.length-1; i >= 0; i--){
			lx.deleteLayers(deleteList[i],"id");
		}
	}

	function isSmartObjectDeformed(cornerPoints, innerWidth, innerHeight){
		var cp = cornerPoints;
		
		var notRectangle = !(cp.leftTop.x === cp.leftBottom.x && cp.rightTop.x === cp.rightBottom.x && cp.leftTop.y === cp.rightTop.y && cp.leftBottom.y === cp.rightBottom.y);
		var notSizeMatch = !((cp.rightTop.x - cp.leftTop.x === innerWidth) && (cp.leftBottom.y - cp.leftTop.y === innerHeight))
		var rotatedOrFlipped = !(cp.leftTop.x < cp.rightTop.x && cp.leftTop.y < cp.rightBottom.y)
		
		var isDeformed = (notRectangle || notSizeMatch || rotatedOrFlipped)
		return isDeformed;
		
	}

	function cornersActionListToObject(nonAffineTransform){
		var result = {};
		result.leftTop = {
			x:nonAffineTransform.getDouble(0), 
			y:nonAffineTransform.getDouble(1)
		};
		result.rightTop = {
			x:nonAffineTransform.getDouble(2), 
			y:nonAffineTransform.getDouble(3)
		};
		result.rightBottom = {
			x:nonAffineTransform.getDouble(4), 
			y:nonAffineTransform.getDouble(5)
		};
		result.leftBottom = {
			x:nonAffineTransform.getDouble(6), 
			y:nonAffineTransform.getDouble(7)
		};
		
	
		return result;    
	}

	function closeWindow(documentID){
		var idCls = cTID( "Cls " );
			var desc255 = new ActionDescriptor();
			var idSvng = cTID( "Svng" );
			var idYsN = cTID( "YsN " );
			var idN = cTID( "N   " );
			desc255.putEnumerated( idSvng, idYsN, idN );
			var idDocI = cTID( "DocI" );
			desc255.putInteger( idDocI, documentID );
			var idforceNotify = sTID( "forceNotify" );
			desc255.putBoolean( idforceNotify, true );
		executeAction( idCls, desc255, DialogModes.NO );
	}

	//
	// hide selected layer(s)
	function hideLayer(){
		var idHd = cTID( "Hd  " );
			var desc19 = new ActionDescriptor();
			var idnull = cTID( "null" );
				var list9 = new ActionList();
					var ref15 = new ActionReference();
					var idLyr = cTID( "Lyr " );
					var idOrdn = cTID( "Ordn" );
					var idTrgt = cTID( "Trgt" );
					ref15.putEnumerated( idLyr, idOrdn, idTrgt );
				list9.putReference( ref15 );
			desc19.putList( idnull, list9 );
		executeAction( idHd, desc19, DialogModes.NO );
	}

	function copyLayerStyle(){
		var idCpFX = cTID( "CpFX" );
		executeAction( idCpFX, undefined, DialogModes.NO );
	}

	function pasteLayerStyle(){
		var idPaFX = cTID( "PaFX" );
			var desc286 = new ActionDescriptor();
			var idallowPasteFXOnLayerSet = sTID( "allowPasteFXOnLayerSet" );
			desc286.putBoolean( idallowPasteFXOnLayerSet, true );
		executeAction( idPaFX, desc286, DialogModes.NO );
	}

	function duplicateVectorMask(idFrom,idAt){
		var idMk = cTID( "Mk  " );
			var desc376 = new ActionDescriptor();
			var idnull = cTID( "null" );
				var ref270 = new ActionReference();
				var idPath = cTID( "Path" );
				ref270.putClass( idPath );
			desc376.putReference( idnull, ref270 );
			var tidAt = cTID( "At  " );
				var ref271 = new ActionReference();
				var idvectorMask = sTID( "vectorMask" );
				ref271.putEnumerated( idPath, idPath, idvectorMask );
				var idLyr = cTID( "Lyr " );
				ref271.putIdentifier( idLyr, idAt );
			desc376.putReference( tidAt, ref271 );
			var idUsng = cTID( "Usng" );
				var ref272 = new ActionReference();
				ref272.putEnumerated( idPath, idPath, idvectorMask );
				var idLyr = cTID( "Lyr " );
				ref272.putIdentifier( idLyr, idFrom );
			desc376.putReference( idUsng, ref272 );
			var idDplc = cTID( "Dplc" );
			desc376.putBoolean( idDplc, true );
		executeAction( idMk, desc376, DialogModes.NO );
	}
	
	function duplicateMask(idFrom,idAt){
		var idMk = cTID( "Mk  " );
			var desc381 = new ActionDescriptor();
			var idNw = cTID( "Nw  " );
			var idChnl = cTID( "Chnl" );
			var tidAt = cTID( "At  " );
			desc381.putClass( idNw, idChnl );
				var ref277 = new ActionReference();
				var idChnl = cTID( "Chnl" );
				var idMsk = cTID( "Msk " );
				ref277.putEnumerated( idChnl, idChnl, idMsk );
				var idLyr = cTID( "Lyr " );
				ref277.putIdentifier( idLyr, idAt );
			desc381.putReference( tidAt, ref277 );
			var idUsng = cTID( "Usng" );
				var ref278 = new ActionReference();
				var idChnl = cTID( "Chnl" );
				var idMsk = cTID( "Msk " );
				ref278.putEnumerated( idChnl, idChnl, idMsk );
				var idLyr = cTID( "Lyr " );
				ref278.putIdentifier( idLyr, idFrom  );
			desc381.putReference( idUsng, ref278 );
			var idDplc = cTID( "Dplc" );
			desc381.putBoolean( idDplc, true );
		executeAction( idMk, desc381, DialogModes.NO );
	}

	function disableVectorMask(id){
		var idsetd = charIDToTypeID( "setd" );
			var desc1320 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref703 = new ActionReference();
				var idLyr = charIDToTypeID( "Lyr " );
				ref703.putIdentifier( idLyr, id);
			desc1320.putReference( idnull, ref703 );
			var idT = charIDToTypeID( "T   " );
				var desc1321 = new ActionDescriptor();
				var idvectorMaskEnabled = stringIDToTypeID( "vectorMaskEnabled" );
				desc1321.putBoolean( idvectorMaskEnabled, false );
			desc1320.putObject( idT, idLyr, desc1321 );
		executeAction( idsetd, desc1320, DialogModes.NO );
	}

	function disableMask(id){
		var idsetd = charIDToTypeID( "setd" );
			var desc1327 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref707 = new ActionReference();
				var idLyr = charIDToTypeID( "Lyr " );
				ref707.putIdentifier( idLyr, id);
			desc1327.putReference( idnull, ref707 );
			var idT = charIDToTypeID( "T   " );
				var desc1328 = new ActionDescriptor();
				var idUsrM = charIDToTypeID( "UsrM" );
				desc1328.putBoolean( idUsrM, false );
			desc1327.putObject( idT, idLyr, desc1328 );
		executeAction( idsetd, desc1327, DialogModes.NO );
	}

	function moveLayerOrder(toIndex, fromID){
		var idmove = cTID( "move" );
			var desc594 = new ActionDescriptor();
			var idnull = cTID( "null" );
				var ref449 = new ActionReference();
				var idLyr = cTID( "Lyr " );
				var idOrdn = cTID( "Ordn" );
				var idTrgt = cTID( "Trgt" );
				ref449.putEnumerated( idLyr, idOrdn, idTrgt );
			desc594.putReference( idnull, ref449 );
			var idT = cTID( "T   " );
				var ref450 = new ActionReference();
				var idLyr = cTID( "Lyr " );
				ref450.putIndex( idLyr, toIndex);
			desc594.putReference( idT, ref450 );
			var idAdjs = cTID( "Adjs" );
			desc594.putBoolean( idAdjs, false );
			var idVrsn = cTID( "Vrsn" );
			desc594.putInteger( idVrsn, 5 );
			var idLyrI = cTID( "LyrI" );
				var list253 = new ActionList();
				list253.putInteger( fromID );
			desc594.putList( idLyrI, list253 );
		
		try{
			executeAction( idmove, desc594, DialogModes.NO );
		}catch(e){
			alert(e.message);
		}
	}
	

	// A helper function for debugging
	// It also helps the user see what is going on
	// if you turn it off for this example you
	// get a flashing cursor for a number time
	function WaitForRedraw()
	{
		var eventWait = cTID("Wait")
		var enumRedrawComplete = cTID("RdCm")
		var typeState = cTID("Stte")
		var keyState = cTID("Stte")
		var desc = new ActionDescriptor()
		desc.putEnumerated(keyState, typeState, enumRedrawComplete)
		executeAction(eventWait, desc, DialogModes.NO)
	}

	function filterValidLayers(indexList){
		var result = [];
		
		for(var i = 0, len=indexList.length; i < len; i++){
			var notLinkMissing = true;
		
			var desc = getLayerDescriptorByID(indexList[i]);
			
			var isSmartObjectLayer = desc.getInteger(sTID('layerKind')) == 5;
			
			if(isSmartObjectLayer){
				var notProtectAll = !desc.getObjectValue(sTID('layerLocking')).getBoolean(sTID('protectAll'));
				var notProtectPosition = !desc.getObjectValue(sTID('layerLocking')).getBoolean(sTID('protectPosition'));
				var notVector = desc.getObjectValue(sTID('smartObject')).getEnumerationValue(sTID('placed')) === sTID("rasterizeContent");
				var hasKeyLinkMissing = desc.getObjectValue(sTID('smartObject')).hasKey(sTID('linkMissing'));
				
				if(hasKeyLinkMissing){
					notLinkMissing = !desc.getObjectValue(sTID('smartObject')).getBoolean(sTID('linkMissing'));
				}
			
				if(notProtectAll && notProtectPosition && notVector && notLinkMissing){
					result.push(indexList[i]);
				}
			}
		}
		
		return result;
	}

	function collapseFolder(){
		var idsetd = charIDToTypeID( "setd" );
			var desc2 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref1 = new ActionReference();
				var idPrpr = charIDToTypeID( "Prpr" );
				var idTxtS = stringIDToTypeID( "layerSectionExpanded" );
				ref1.putProperty( idPrpr, idTxtS );
				var idLyr = charIDToTypeID( "Lyr " );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idTrgt = charIDToTypeID( "Trgt" );
				ref1.putEnumerated( idLyr, idOrdn, idTrgt );
			desc2.putReference( idnull, ref1 );
			var idT = charIDToTypeID( "T   " );
			desc2.putBoolean( charIDToTypeID( "T   " ), false );
			desc2.putBoolean( stringIDToTypeID( "recursive" ), true );
		executeAction( idsetd, desc2, DialogModes.NO );
	}

	function translate(x,y){
		var desc = new LxActionDescriptor();
		desc.lxRefLayer();
		var descTo = new LxActionDescriptor();
		descTo.putUnitDouble("horizontal", "pixelsUnit", x);
		descTo.putUnitDouble("vertical", "pixelsUnit", y);
		desc.putObject("to","offset", descTo);
		
		try{
			executeAction( "move", desc);
		}catch(e){
			// e.g. empty bounding box... no pixel to transform 
		}
	}

	function calculateScaleRatio(width, height, soPoints){
		var soInnerPerimeter = (width*2 + height*2);
		var soDeformedPerimeter = 0;
		
		var leftTopX = soPoints.getDouble(0);
		var leftTopY = soPoints.getDouble(1);
		var rightTopX = soPoints.getDouble(2) - leftTopX;
		var rightTopY = soPoints.getDouble(3) - leftTopY;
		var rightBottomX = soPoints.getDouble(4) - leftTopX;
		var rightBottomY = soPoints.getDouble(5) - leftTopY;
		var leftBottomX = soPoints.getDouble(6) - leftTopX;
		var leftBottomY = soPoints.getDouble(7) - leftTopY;
		leftTopX = 0;
		leftTopY = 0;
		
		soDeformedPerimeter += edgeLength (leftTopX, leftTopY, rightTopX, rightTopY);
		soDeformedPerimeter += edgeLength (rightTopX, rightTopY, rightBottomX, rightBottomY);
		soDeformedPerimeter += edgeLength (rightBottomX, rightBottomY, leftBottomX, leftBottomY);
		soDeformedPerimeter += edgeLength (leftBottomX, leftBottomY, leftTopX, leftTopY);
		
		function edgeLength (xa, ya, xb, yb){
			return Math.sqrt( Math.pow(xb - xa, 2) + Math.pow(yb - ya,2));
		}
		
		var result = (soDeformedPerimeter / soInnerPerimeter) * 100;
		return result;
	}

	function doRectangleToQuadrilateral(width, height, cornerPoints){
		var right = width, bottom = height;
		var quadRect = new ActionList();
		
		quadRect.putUnitDouble(charIDToTypeID('#Pxl'),0); //leftTop
		quadRect.putUnitDouble(charIDToTypeID('#Pxl'),0);

		quadRect.putUnitDouble(charIDToTypeID('#Pxl'),right); //rightBottom
		quadRect.putUnitDouble(charIDToTypeID('#Pxl'),bottom);
		
		function transform(quadRect, points, rightBottomX, rightBottomY){
			var args = new ActionDescriptor();
			var quadCorners = new ActionList();
			
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), points.leftTop.x);   //left top
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), points.leftTop.y);
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), points.rightTop.x);   //right top
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), points.rightTop.y);
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), rightBottomX || points.rightBottom.x);         //right bottom
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), rightBottomY || points.rightBottom.y); 
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), points.leftBottom.x);   //left bottom
			quadCorners.putUnitDouble( charIDToTypeID('#Pxl'), points.leftBottom.y);

			args.putList( stringIDToTypeID("rectangle"), quadRect );
			args.putList( stringIDToTypeID("quadrilateral"), quadCorners );

			executeAction( charIDToTypeID('Trnf'), args );
		}
	
		try{
			transform(quadRect, cornerPoints);
		}catch(e){
			// we can't do only parallelograms if smartObject content contains text layers or vector smart objects
			var rightBottomX = cornerPoints.leftBottom.x + (cornerPoints.rightTop.x - cornerPoints.leftTop.x);
			var rightBottomY = cornerPoints.leftBottom.y + (cornerPoints.rightTop.y - cornerPoints.leftTop.y);
			
			try{
				transform(quadRect, cornerPoints, rightBottomX, rightBottomY);
			}catch(e){
				/* e.g. empty bounding box... no pixel to transform */
			}
		}
	}

	function canCopyPasteStyle(desc){
		var result = desc.hasKey(stringIDToTypeID('layerEffects')) || desc.getEnumerationValue(stringIDToTypeID('mode')) !== stringIDToTypeID("normal") || desc.getInteger(stringIDToTypeID('opacity')) !== 255 || desc.getInteger(stringIDToTypeID('fillOpacity')) !==255;
		return result;
	}


	function deselectPath(){
		var idDslc = charIDToTypeID( "Dslc" );
			var desc1797 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref990 = new ActionReference();
				var idPath = charIDToTypeID( "Path" );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idTrgt = charIDToTypeID( "Trgt" );
				ref990.putEnumerated( idPath, idOrdn, idTrgt );
			desc1797.putReference( idnull, ref990 );
		executeAction( idDslc, desc1797, DialogModes.NO );
	}

	function ungroupSelectedLayer(){
		var idungroupLayersEvent = stringIDToTypeID( "ungroupLayersEvent" );
		var desc204 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
			var ref118 = new ActionReference();
			var idLyr = charIDToTypeID( "Lyr " );
			var idOrdn = charIDToTypeID( "Ordn" );
			var idTrgt = charIDToTypeID( "Trgt" );
			ref118.putEnumerated( idLyr, idOrdn, idTrgt );
		desc204.putReference( idnull, ref118 );
		executeAction( idungroupLayersEvent, desc204, DialogModes.NO );
	}

	function selectPixels(left, top, width, height){
		var idsetd = charIDToTypeID( "setd" );
			var desc683 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref276 = new ActionReference();
				var idChnl = charIDToTypeID( "Chnl" );
				var idfsel = charIDToTypeID( "fsel" );
				ref276.putProperty( idChnl, idfsel );
			desc683.putReference( idnull, ref276 );
			var idT = charIDToTypeID( "T   " );
				var desc684 = new ActionDescriptor();
				var idTop = charIDToTypeID( "Top " );
				var idPxl = charIDToTypeID( "#Pxl" );
				desc684.putUnitDouble( idTop, idPxl, top );
				var idLeft = charIDToTypeID( "Left" );
				var idPxl = charIDToTypeID( "#Pxl" );
				desc684.putUnitDouble( idLeft, idPxl, left );
				var idBtom = charIDToTypeID( "Btom" );
				var idPxl = charIDToTypeID( "#Pxl" );
				desc684.putUnitDouble( idBtom, idPxl, top+height );
				var idRght = charIDToTypeID( "Rght" );
				var idPxl = charIDToTypeID( "#Pxl" );
				desc684.putUnitDouble( idRght, idPxl, left+width );
			var idRctn = charIDToTypeID( "Rctn" );
			desc683.putObject( idT, idRctn, desc684 );
		executeAction( idsetd, desc683, DialogModes.NO );
	}

	function preventFromArtboardMessUp(){
		var desc = new LxActionDescriptor();
		desc.lxRefLayer();
		desc.putBoolean( "autoNestEnabled" , false );
		desc.putBoolean( "autoExpandEnabled" , false );
		desc.putBoolean( "autoPositionEnabled" , false );		
		executeAction( "editArtboardEvent", desc);
	}

	function revertArtboardsSettings(){
		var desc = new LxActionDescriptor();
		desc.lxRefLayer();
		desc.putBoolean( "autoNestEnabled" , artboardsSettings.autoNestEnabled );
		desc.putBoolean( "autoExpandEnabled" , artboardsSettings.autoExpandEnabled );
		desc.putBoolean( "autoPositionEnabled" , artboardsSettings.autoPositionEnabled );		
		executeAction( "editArtboardEvent", desc);
	}

	function deselectPixels(){
		var idsetd = charIDToTypeID( "setd" );
			var desc1000 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref414 = new ActionReference();
				var idChnl = charIDToTypeID( "Chnl" );
				var idfsel = charIDToTypeID( "fsel" );
				ref414.putProperty( idChnl, idfsel );
			desc1000.putReference( idnull, ref414 );
			var idT = charIDToTypeID( "T   " );
			var idOrdn = charIDToTypeID( "Ordn" );
			var idNone = charIDToTypeID( "None" );
			desc1000.putEnumerated( idT, idOrdn, idNone );
		executeAction( idsetd, desc1000, DialogModes.NO );
	}

	function createMask(){
		var idMk = charIDToTypeID( "Mk  " );
			var desc685 = new ActionDescriptor();
			var idNw = charIDToTypeID( "Nw  " );
			var idChnl = charIDToTypeID( "Chnl" );
			desc685.putClass( idNw, idChnl );
			var idAt = charIDToTypeID( "At  " );
				var ref277 = new ActionReference();
				var idChnl = charIDToTypeID( "Chnl" );
				var idChnl = charIDToTypeID( "Chnl" );
				var idMsk = charIDToTypeID( "Msk " );
				ref277.putEnumerated( idChnl, idChnl, idMsk );
			desc685.putReference( idAt, ref277 );
			var idUsng = charIDToTypeID( "Usng" );
			var idUsrM = charIDToTypeID( "UsrM" );
			var idRvlS = charIDToTypeID( "RvlS" );
			desc685.putEnumerated( idUsng, idUsrM, idRvlS );
		executeAction( idMk, desc685, DialogModes.NO );
	}

	function setColorTag(pointer, type, color){
		var idsetd = charIDToTypeID( "setd" );
			var desc149 = new LxActionDescriptor();
			desc149.lxRefLayer(pointer,type);
				var desc150 = new LxActionDescriptor();
				desc150.putEnumerated( "Clr ", "Clr ", color );
			desc149.putObject( "T   ", "Lyr ", desc150 );
		executeAction( idsetd, desc149, DialogModes.NO );
	}

	function undo(){
		var idslct = charIDToTypeID( "slct" );
			var desc485 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref182 = new ActionReference();
				var idHstS = charIDToTypeID( "HstS" );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idPrvs = charIDToTypeID( "Prvs" );
				ref182.putEnumerated( idHstS, idOrdn, idPrvs );
			desc485.putReference( idnull, ref182 );
		executeAction( idslct, desc485, DialogModes.NO );
	}

	// that's not photoshop comps. That is my custom overview
	function getCompsCount(obj){
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key) && (key !== "file" || key !== "windowMethod")) size++;
		}
		return size;
	}

	// not tested on Mac. I don't know if cloud files are always synced. Workaround is embeding SO into document.
	function getCloudFilePath(soDesc){
		var lookUpFile = new File(Folder.userData + "/Adobe/Creative Cloud Libraries/LIBS/librarylookupfile");
		if(!lookUpFile.exists)
		{
			throw "Error! Lookup file for cloud assests not found. Try embed smart objects first.";
		}

		var assetUrl = soDesc.getObjectValue(stringIDToTypeID('smartObject')).getObjectValue(stringIDToTypeID('link')).getString(stringIDToTypeID('elementReference'));
		var urlEnd = assetUrl.split("/adobe-libraries/")[1];
		var library = urlEnd.split(";node=")[0];
		var item = urlEnd.split(";node=")[1];

		lookUpFile.open('r');
		var str = "";
		while(!lookUpFile.eof)
		str += lookUpFile.readln();
		lookUpFile.close();
		
		var lookUpObj = eval("("+str+")");
		var pathToSo = lookUpObj.libraries[library].elements[item].reps[0].path;
		if(!pathToSo)throw "Couldn't find path to temp file of could smart objects. Try embed smart objects first.";
		
		return pathToSo;
	}

	function renameLayer(id, name){
		var idsetd = charIDToTypeID( "setd" );
		var desc573 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
			var ref322 = new ActionReference();
			var idLyr = charIDToTypeID( "Lyr " );
			ref322.putIdentifier( idLyr, id );
		desc573.putReference( idnull, ref322 );
		var idT = charIDToTypeID( "T   " );
			var desc574 = new ActionDescriptor();
			var idNm = charIDToTypeID( "Nm  " );
			desc574.putString( idNm, name );
		var idLyr = charIDToTypeID( "Lyr " );
		desc573.putObject( idT, idLyr, desc574 );
		executeAction( idsetd, desc573, DialogModes.NO );
	}

	// here we utilize generator plugin
	function getLayerCompsData(){
		var docRef = new ActionReference();  
		var desc = new ActionDescriptor();  
		var JSONid = stringIDToTypeID("json");  
		docRef.putProperty(charIDToTypeID('Prpr'), JSONid);  
		docRef.putEnumerated(stringIDToTypeID("document"), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));  
		desc.putReference(charIDToTypeID('null'), docRef);  
		desc.putBoolean(stringIDToTypeID("compInfo"), true);  // just return the Layer Comp settings  
		desc.putBoolean(stringIDToTypeID( "getCompLayerSettings" ), false); // return Layer Comp settings for each layer  
		var result = executeAction(charIDToTypeID( "getd" ), desc, DialogModes.NO).getString(JSONid);  
		result = eval("("+result+")");
		return result;
	}
	
	// data input is object from generator plugin
	function getActiveComp(data){
		if(data.comps){
			var comps = data.comps;
			for(var i = 0, len = comps.length; i < len ; i++){
				var activeComp = comps[i];
				if(activeComp.hasOwnProperty("applied") && activeComp.applied === true){
					return activeComp.id;
				}
			}
		}
		return 0;
	}

	function selectDocument(documentID){
		var idslct = charIDToTypeID( "slct" );
			var desc2664 = new ActionDescriptor();
				var ref1382 = new ActionReference();
				var idDcmn = charIDToTypeID( "Dcmn" );
				ref1382.putIdentifier( idDcmn, documentID );
			desc2664.putReference( charIDToTypeID( "null" ), ref1382 );
		executeAction( idslct, desc2664, DialogModes.NO );
	}

	function isPathSelected(){
		var ref = new ActionReference();   
		ref.putProperty(charIDToTypeID( "Prpr" ), stringIDToTypeID("targetPathIndex"));  
		ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );    
		var desc = executeActionGet(ref);   
		var targetPathIndex = desc.getDouble(stringIDToTypeID ("targetPathIndex"));
		var isSelected = targetPathIndex !== -1;
		return isSelected;
	}

	function makeHistorySnapshot(snapshotName){
		var idMk = charIDToTypeID( "Mk  " );
			var desc11 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref5 = new ActionReference();
				var idSnpS = charIDToTypeID( "SnpS" );
				ref5.putClass( idSnpS );
			desc11.putReference( idnull, ref5 );
			var idFrom = charIDToTypeID( "From" );
				var ref6 = new ActionReference();
				var idHstS = charIDToTypeID( "HstS" );
				var idCrnH = charIDToTypeID( "CrnH" );
				ref6.putProperty( idHstS, idCrnH );
			desc11.putReference( idFrom, ref6 );
			var idNm = charIDToTypeID( "Nm  " );
			desc11.putString( idNm, snapshotName );
			var idUsng = charIDToTypeID( "Usng" );
			var idHstS = charIDToTypeID( "HstS" );
			var idFllD = charIDToTypeID( "FllD" );
			desc11.putEnumerated( idUsng, idHstS, idFllD );
		executeAction( idMk, desc11, DialogModes.NO );
	}

	function removeHistorySnapshot(snapshotName){
		var idDlt = charIDToTypeID( "Dlt " );
			var desc35 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref23 = new ActionReference();
				var idSnpS = charIDToTypeID( "SnpS" );
				ref23.putName( idSnpS, snapshotName );
			desc35.putReference( idnull, ref23 );
		executeAction( idDlt, desc35, DialogModes.NO );
	}

	function restoreFromSnapshot(snapshotName){
		var idslct = charIDToTypeID( "slct" );
			var desc36 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref24 = new ActionReference();
				var idSnpS = charIDToTypeID("SnpS");
				ref24.putName( idSnpS, snapshotName );
			desc36.putReference( idnull, ref24 );
		executeAction( idslct, desc36, DialogModes.NO );
	}

	function getArtboardSettings(){
		artboardDesc = lx.getDocumentProperty("artboards");
			
		var result = { 
			autoNestEnabled: artboardDesc.getBoolean("autoNestEnabled"),
			autoExpandEnabled: artboardDesc.getBoolean("autoExpandEnabled"),
			autoPositionEnabled: artboardDesc.getBoolean("autoPositionEnabled")
		};			
			
		return result;
	}

	function isVectorMaskEnabled(){  
		var lastIndex = docMaster.pathItems.length;  
		  
		// if there is no item mask can be disabled or not even exists  
		// so you could want check for existing vector mask before your call this function  
		if(lastIndex===0){return false}  
		  
		// vector mask should be last in paths list. If is not selected then it has "normal" kind. So we select last path.  
		var desc = new ActionDescriptor();  
		var ref = new ActionReference();  
		ref.putIndex( charIDToTypeID( "Path" ), lastIndex );  
		desc.putReference( charIDToTypeID( "null" ), ref );  
		executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO ); 
	  
		// now we check which kind is most bottom path  
		var lastPathInList = docMaster.pathItems[lastIndex-1];  
		var isVectorMaskEnabled = lastPathInList.kind === PathKind.VECTORMASK;  
		return isVectorMaskEnabled;  
		
		// another method is trying to get path with reference and this reference has vector mask property
	}  
}

///////////////////
//  SCALE STYLES
///////////////////

function scaleSelectedLayersStyle (scaleFactorPercent, selectedLayers){
	// YOU CAN ADJUST SCRIPT TO FIT YOUR NEEDS. POSSIBLE VALUES ARE "TRUE" OR "FALSE"
	// You might thing that I am noob because this code is to complicate. But this also scale shape styles not only layer effects.
	styleSettings = settings.styleScaleSettings

	// performance - don't even select shape layer if we won't change shape styles
	styleSettings["dontScaleShape"] = (!styleSettings.scaleShapeStrokeWidth && !styleSettings.scaleShapePatternFill && !styleSettings.scaleShapeGradientFill && !styleSettings.scaleShapeStrokeGradient && !styleSettings.scaleShapeStrokePattern);

	main();

	function main(){
		var layersWithStyle = filterLayersWithStyle(selectedLayers);
		var layersWithShape = filterLayersWithShape(selectedLayers);
		scaleFactorPercent = round2(scaleFactorPercent);
		
		if(scaleFactorPercent === 100){return} // skip effect scaling if nothing would change
		
		
		for(var i = 0, prgs, cancel = false, len = selectedLayers.length; i < len; i++){
			
			if(!prgs){
				prgs=PltProgress(len, "Styles scaling...");
				prgs.show();
			}
			
			var index = selectedLayers[i];
			var hasStyle = layersWithStyle.indexOf(index) >= 0;
			var hasShape = layersWithShape.indexOf(index) >= 0;
			var desc;
			
			if(hasStyle || hasShape){
				desc = getLayerDescriptor (index);
				setSelectedLayer (index);
			}
			
			if(hasStyle){
				cancel = scaleStyles(scaleFactorPercent);
			}
			
			if(hasShape){
				var shapeProperties = {
					scaleRatio: scaleFactorPercent/100,
					strokeWidth: getStrokeWidth(desc),
					
					shapePatternScale: getShapePatternScale(desc),
					shapeGradientScale: getShapeGradientScale(desc),
					
					shapeStrokeGradientScale: getShapeStrokeGradientScale(desc),
					shapeStrokePatternScale: getShapeStrokePatternScale(desc)
				}
				
				var strokeDesc = changeStrokeDesc( desc.getObjectValue(stringIDToTypeID('AGMStrokeStyleInfo')), shapeProperties);
				var fillDesc = changeFillDesc(desc.getList(stringIDToTypeID('adjustment')).getObjectValue(0), shapeProperties);
				var fillKey = getFillKey(fillDesc);
				
				cancel = applyShapeDescriptor (index, fillDesc, strokeDesc, fillKey);
			}
			if(cancel){return;}
			cancel = prgs.update(i,("Styles scaling: "+i+" layers from " + len));
			if(cancel){return;}
		}
	}

	function getFillKey(fillDesc){
		var fillKey;
		
		if(fillDesc.hasKey(stringIDToTypeID("pattern"))){
			fillKey = stringIDToTypeID("patternLayer");
		} else if(fillDesc.hasKey(stringIDToTypeID("gradient"))){
			fillKey = stringIDToTypeID("gradientLayer");
		} else {
			fillKey = stringIDToTypeID("solidColorLayer");
		}

		return fillKey;
	}


	function scaleStyles(value){
		try{
			var idscaleEffectsEvent = stringIDToTypeID( "scaleEffectsEvent" );
				var desc66 = new ActionDescriptor();
				var idScl = charIDToTypeID( "Scl " );
				var idPrc = charIDToTypeID( "#Prc" );
				desc66.putUnitDouble( idScl, idPrc, value );
			executeAction( idscaleEffectsEvent, desc66, DialogModes.NO );
		}catch(e){
			if (e.number === 8007) { // if not "User cancelled"  
				return true;
			}
			// some layer can have layerEffects descriptor but descriptor is not visible so scale
		}
	}


	function changeFillDesc(desc, props){
		if(props.shapeGradientScale !== false && styleSettings.scaleShapeGradientFill){
			desc.putDouble(stringIDToTypeID('scale'),round2(props.shapeGradientScale * props.scaleRatio));
		}
		if(props.shapePatternScale !== false && styleSettings.scaleShapePatternFill){
			desc.putDouble(stringIDToTypeID('scale'),round2(props.shapePatternScale * props.scaleRatio));
		}

		return desc;
	}

	function changeStrokeDesc(desc, props){
		if(props.strokeWidth !== false && styleSettings.scaleShapeStrokeWidth){
			var strokeDoubleType = desc.getUnitDoubleType(stringIDToTypeID('strokeStyleLineWidth'));
			desc.putUnitDouble(stringIDToTypeID('strokeStyleLineWidth'), strokeDoubleType ,round2(props.strokeWidth * (props.scaleRatio)));
			// putUnitDouble namísto double
		}
		
		if(props.shapeStrokeGradientScale !== false && styleSettings.scaleShapeStrokeGradient){
			var gradientDesc = desc.getObjectValue(stringIDToTypeID('strokeStyleContent'));
			gradientDesc.putDouble(stringIDToTypeID('scale'),round2(props.shapeStrokeGradientScale * props.scaleRatio));
			desc.putObject(stringIDToTypeID('strokeStyleContent'),stringIDToTypeID('strokeStyleContent'),gradientDesc);
		}
		if(props.shapeStrokePatternScale !== false && styleSettings.scaleShapeStrokePattern){
			var patternDesc = desc.getObjectValue(stringIDToTypeID('strokeStyleContent'));
			patternDesc.putDouble(stringIDToTypeID('scale'),round2(props.shapeStrokePatternScale * props.scaleRatio));
			desc.putObject(stringIDToTypeID('strokeStyleContent'),stringIDToTypeID('strokeStyleContent'),patternDesc);
		}

		return desc;
	}

	//
	// Function: getSelectedLayers
	// Usage: creates and array of the currently selected layers
	// Input: <none> Must have an open document
	// Return: Array selectedLayers
	function getSelectedLayers() {
		var selectedLayers = [];
		try {
		   var backGroundCounter = 1;
			try {
				var dummy = app.activeDocument.backgroundLayer;
				backGroundCounter = 0;
			}
			catch(e){;} //do nothing
			
			var ref = new ActionReference();
			var keyTargetLayers = app.stringIDToTypeID( 'targetLayers' );
			ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyTargetLayers );
			ref.putEnumerated( app.charIDToTypeID( 'Dcmn' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
			var desc = executeActionGet( ref );
			if ( desc.hasKey( keyTargetLayers ) ) {
				var layersList = desc.getList( keyTargetLayers );
				for ( var i = 0; i < layersList.count; i++) {
					var listRef = layersList.getReference( i );
					selectedLayers.push( listRef.getIndex() + backGroundCounter );
				}
			}
		}catch(e) {
			; // do nothing
		}
		return selectedLayers;
	}

	function setSelectedLayers(list){
		setSelectedLayer(list[0]);
		addSelectedLayer(list);
	}

	function setSelectedLayer( layerIndexOrName ) {
		try {
			var id239 = charIDToTypeID( "slct" );
			var desc45 = new ActionDescriptor();
			var id240 = charIDToTypeID( "null" );
			var ref43 = new ActionReference();
			var id241 = charIDToTypeID( "Lyr " );
			if ( typeof layerIndexOrName == "number" ) {
				ref43.putIndex( id241, layerIndexOrName );
			} else {
				ref43.putName( id241, layerIndexOrName );
			}
			desc45.putReference( id240, ref43 );
			var id242 = charIDToTypeID( "MkVs" );
			desc45.putBoolean( id242, false );
			executeAction( id239, desc45, DialogModes.NO );
		}catch(e) {
			alert(e.message); // do nothing
		}
	}

	function addSelectedLayer( layerIndexOrName ) {
		try {
			var len=1;
			if( Object.prototype.toString.call( layerIndexOrName ) === '[object Array]' ) {
				len = layerIndexOrName.length;
			}
			for ( var i = 0;i<len;i++){
				var id243 = charIDToTypeID( "slct" );
				var desc46 = new ActionDescriptor();
				var id244 = charIDToTypeID( "null" );
				var ref44 = new ActionReference();
				var id245 = charIDToTypeID( "Lyr " );
				if ( typeof layerIndexOrName == "number" ) {
					ref44.putIndex( id245, layerIndexOrName );
				} 
				else if( Object.prototype.toString.call( layerIndexOrName ) === '[object Array]' ){ //když to je pole
					ref44.putIndex( id245, layerIndexOrName[i] );
				}
				else {
					ref44.putName( id245, layerIndexOrName );
				}
				desc46.putReference( id244, ref44 );
				var id246 = stringIDToTypeID( "selectionModifier" );
				var id247 = stringIDToTypeID( "selectionModifierType" );
				var id248 = stringIDToTypeID( "addToSelection" );
				desc46.putEnumerated( id246, id247, id248 );
				var id249 = charIDToTypeID( "MkVs" );
				desc46.putBoolean( id249, false );
				executeAction( id243, desc46, DialogModes.NO );
			}
		}catch(e) {
			alert(e.message); // do nothing
		}
	}

	function filterLayersWithStyle(list){
		var result = [];
		
		if(styleSettings.scaleStyle){
			for(var i = 0, len = list.length; i < len; i++){
				var index = list[i];
				var desc = getLayerDescriptor(index) ;
				var hasStyle = desc.hasKey(stringIDToTypeID('layerEffects'));
				if(hasStyle){
					result.push(index);
				}
			}
		}

		return result;
	}

	function filterLayersWithShape(list){
		var result = [];
		
		if(styleSettings.dontScaleShape === false){
			for(var i = 0, len = list.length; i < len; i++){
				var index = list[i];
				var desc = getLayerDescriptor(index);
				var shapePatternScale = getShapePatternScale(desc);
				var shapeGradientScale = getShapeGradientScale(desc);
				
				if(hasStroke(desc) || shapePatternScale !== false || shapeGradientScale !== false){
					result.push(index);
				}
			}
		}

		return result;
	}

	function getStrokeWidth(desc){
		if(!desc.getObjectValue(stringIDToTypeID('AGMStrokeStyleInfo')).hasKey(stringIDToTypeID('strokeStyleLineWidth'))){return false}
		
		var result = desc.getObjectValue(stringIDToTypeID('AGMStrokeStyleInfo')).getUnitDoubleValue(stringIDToTypeID('strokeStyleLineWidth'));
		return result;
	}

	function hasStroke(desc){
		var hasStrokeWidth = desc.hasKey(stringIDToTypeID('AGMStrokeStyleInfo')) && desc.getObjectValue(stringIDToTypeID('AGMStrokeStyleInfo')).hasKey(stringIDToTypeID('strokeStyleLineWidth'));
		var isShape = desc.getInteger(stringIDToTypeID('layerKind')) === 4;
		var has = hasStrokeWidth && isShape;
		return has;
	}

	function getShapeStrokeGradientScale(desc){
		
		var strokeDesc = desc.getObjectValue(stringIDToTypeID('AGMStrokeStyleInfo'));
		var hasStrokeStyle = strokeDesc.hasKey(stringIDToTypeID('strokeStyleContent'));
		if(!hasStrokeStyle){return false}
		
		var strokeStyleContentDesc = strokeDesc.getObjectValue(stringIDToTypeID('strokeStyleContent'));
		
		var isGradient = strokeStyleContentDesc.hasKey(stringIDToTypeID('gradient'));
		if(!isGradient){return false}
		
		// we don't need scale gradient if align with layer is true
		var isAlignedToLayer = strokeStyleContentDesc.getBoolean(stringIDToTypeID('align'));
		if(isAlignedToLayer){return false}
		
		var strokeGradientScale = strokeStyleContentDesc.getUnitDoubleValue(stringIDToTypeID('scale'));
		
		return strokeGradientScale;
	}


	function getShapeStrokePatternScale(desc){
		
		var strokeDesc = desc.getObjectValue(stringIDToTypeID('AGMStrokeStyleInfo'));
		var hasStrokeStyle = strokeDesc.hasKey(stringIDToTypeID('strokeStyleContent'));
		if(!hasStrokeStyle){return false}
		
		var strokeStyleContentDesc = strokeDesc.getObjectValue(stringIDToTypeID('strokeStyleContent'));
		
		var isPattern = strokeStyleContentDesc.hasKey(stringIDToTypeID('pattern'));
		if(!isPattern){return false}
		
		var strokePatternScale = strokeStyleContentDesc.getUnitDoubleValue(stringIDToTypeID('scale'));
		
		return strokePatternScale;
	}


	// fillKey = typeID
	// fillDesc = gradientLayer
	// strokeDesc = descAGMStrokeStyleInfo
	function applyShapeDescriptor(layerIndex, fillDesc, strokeDesc, fillKey){
	   var idsetd = charIDToTypeID( "setd" );
			var desc1176 = new ActionDescriptor();
			var idnull = charIDToTypeID( "null" );
				var ref301 = new ActionReference();
				var idcontentLayer = stringIDToTypeID( "contentLayer" );
				var idOrdn = charIDToTypeID( "Ordn" );
				var idTrgt = charIDToTypeID( "Trgt" );
				ref301.putEnumerated( idcontentLayer, idOrdn, idTrgt );
				//ref301.putIndex(idcontentLayer, layerIndex)
			desc1176.putReference( idnull, ref301 );
			var idT = charIDToTypeID( "T   " );
				var descShapeStyle = new ActionDescriptor();
				
				var idFlCn = stringIDToTypeID( "fillContents" );
				descShapeStyle.putObject( idFlCn, fillKey, fillDesc );
				
				var idstrokeStyle = stringIDToTypeID( "strokeStyle" );
				descShapeStyle.putObject( idstrokeStyle, idstrokeStyle, strokeDesc );
				
			var idshapeStyle = stringIDToTypeID( "shapeStyle" );
			desc1176.putObject( idT, idshapeStyle, descShapeStyle );
		try{
			executeAction( idsetd, desc1176, DialogModes.NO );
		}catch(e){
			if (e.number === 8007) { // if not "User cancelled"  
				return true;
			}
			throw e; 
		}
	}


	function getShapePatternScale(desc){
		// adjustments present
		if(!desc.hasKey(stringIDToTypeID('adjustment'))){return false;}
		
		// patternLayer present
		var adjustmentList = desc.getList(stringIDToTypeID('adjustment'));
		var patternLayerPosition = getKeyPositionInActionList(adjustmentList, stringIDToTypeID("patternLayer"));
		if( patternLayerPosition === -1 ){return false}
		
		var patternDesc = adjustmentList.getObjectValue(patternLayerPosition);
		
		// if everything except scale exists then scale should be 100%
		var hasScaleKey = patternDesc.hasKey(stringIDToTypeID('scale'));
		if( !hasScaleKey ){return 100}
		
		// get scale value
		var patternScale = patternDesc.getUnitDoubleValue(stringIDToTypeID('scale'));
		return patternScale;
	}

	function getShapeGradientScale(desc){
		
		// adjustments present
		if(!desc.hasKey(stringIDToTypeID('adjustment'))){return false;}
		
		// patternLayer present
		var adjustmentList = desc.getList(stringIDToTypeID('adjustment'));
		var gradientLayerPosition = getKeyPositionInActionList(adjustmentList, stringIDToTypeID("gradientLayer"));
		if( gradientLayerPosition === -1 ){return false}
		
		var gradientDesc = adjustmentList.getObjectValue(gradientLayerPosition);
		
		// we don't need scale gradient if align with layer is true
		var hasAlignKey = gradientDesc.hasKey(stringIDToTypeID('align'));
		if( !hasAlignKey ){return false}
		
		// if everything except scale exists then scale should be 100%
		var hasScaleKey = gradientDesc.hasKey(stringIDToTypeID('scale'));
		if( !hasScaleKey ){return 100}
		
		var gradientScale = gradientDesc.getUnitDoubleValue(stringIDToTypeID('scale'))
		
		return gradientScale;

	}

	// objectType
	// key = typeID
	function getKeyPositionInActionList(list, key){
		for (var i = 0, len = list.count; i < len; i++){
			var isKeyFound = list.getObjectType(i) == key;
			if(isKeyFound){
				return i;
			}
		}
		return -1;
	}

	function getLayerDescriptor(index){
		var ref = new ActionReference();  
		ref.putIndex( charIDToTypeID( "Lyr " ), index );    
		var desc = executeActionGet(ref); 
		return desc;
	}

	function getLayerIndexByID(id){
		var backGroundCounter = 0;
			try {
				var dummy = app.activeDocument.backgroundLayer;
				backGroundCounter = -1;
			}
			catch(e){;} //do nothing
		
		var ref = new ActionReference();  
		ref.putProperty(charIDToTypeID( "Prpr" ), stringIDToTypeID("itemIndex"));
		ref.putIdentifier( charIDToTypeID( "Lyr " ), id );    
		var desc = executeActionGet(ref); 
		var index = desc.getInteger(stringIDToTypeID('itemIndex')) + backGroundCounter;
		return index;
	}

	function round2 (num){
		return Math.round(num * 100) / 100;
	}
	
	function PltProgress(maximum, message) {
		var obj = {};
		var win;
		var closed = false;
		var max = maximum;
		var msg = message;
	  
		obj.show = function() {
			 var winContructorString = """palette{
				text:'Progress',
				message:StaticText{text:'"""+msg+""""',alignment: 'fill'},
				myRow: Panel { 
					orientation: 'row',
					margins:0,
					properties:{borderStyle: none}
					panel:Panel{
						margins:0,
						bar:Progressbar{
							bounds:[20,20,280,31], 
							value:0,
							maxvalue:"""+max+"""
						}
					},
					cancel:Button{ 
						text: 'Cancel', 
						properties:{name:'cancel'}
					}
				}
				
				};""";
				win = new Window(winContructorString);
				win.onClose = function(){
					win.close();
					closed = true;
				}

				win.myRow.cancel.onClick = function(){
					win.close();
					closed = true;
				}
				win.show();
				
				return closed;
		};
		obj.hide = function() {
			closed = true;
			win.close();
		};
		obj.update = function(step, updateMessage){
			win.myRow.panel.bar.value = step;
			win.message.text = updateMessage;
			if(step === max){closed = true;win.close();}
			return closed;
		}
		return obj;
	}
}

function applyPollyFills(){
	
	if (!Array.prototype.indexOf) {
		  Array.prototype.indexOf = function(searchElement, fromIndex) {
			var k;
			if (this == null) {
			  throw new TypeError('"this" is null or not defined');
			}

			var o = Object(this);
			var len = o.length >>> 0;
			if (len === 0) {
			  return -1;
			}
			var n = fromIndex | 0;
			if (n >= len) {
			  return -1;
			}
			k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
			while (k < len) {
			  if (k in o && o[k] === searchElement) {
				return k;
			  }
			  k++;
			}
			return -1;
		  };
		}

	if (!Array.prototype.findValueIndex) {
		Array.prototype.findValueIndex = function(value) {
			var o = Object(this);
			for(var i = 0, len = o.length; i < len; i++){
				if(o[i] == value){
					return i;
				}
			}
			return -1;
		}
	}
	
	if (!Array.prototype.findIndex) {
		Array.prototype.findIndex = function(predicate) {
		 // 1. Let O be ? ToObject(this value).
		  if (this == null) {
			throw new TypeError('"this" is null or not defined');
		  }

		  var o = Object(this);

		  // 2. Let len be ? ToLength(? Get(O, "length")).
		  var len = o.length >>> 0;

		  // 3. If IsCallable(predicate) is false, throw a TypeError exception.
		  if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		  }

		  // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
		  var thisArg = arguments[1];

		  // 5. Let k be 0.
		  var k = 0;

		  // 6. Repeat, while k < len
		  while (k < len) {
			// a. Let Pk be ! ToString(k).
			// b. Let kValue be ? Get(O, Pk).
			// c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
			// d. If testResult is true, return k.
			var kValue = o[k];
			if (predicate.call(thisArg, kValue, k, o)) {
			  return k;
			}
			// e. Increase k by 1.
			k++;
		  }

		  // 7. Return -1.
		  return -1;
		}
	}
}

// Reset the application preferences
app.displayDialogs = startDisplayDialogs;