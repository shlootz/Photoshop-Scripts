app.bringToFront();

try{
var theFile = new File(File($.fileName).path +"/~getEventTarget.jsx");
app.notifiers.add("Trnf", theFile);
	
}catch(err){};
if(IsWindowsOS()){
	var mb_trnsfFile = new File(File($.fileName).path +"/~trnsf.vbs");
	mb_trnsfFile.execute();
}
if(IsMacintoshOS()){
	var mb_trnsfFile = new File(File($.fileName).path +"/~trnsf.command");
	mb_trnsfFile.execute()
}

    function IsMacintoshOS() {
        if ( $.os.search(/macintosh/i) != -1 ) {
            return true;
        } else {
            return false;
        }
    }


    function IsWindowsOS() {
        if ( $.os.search(/windows/i) != -1 ) {
            return true;
        } else {
            return false;
        }
    }