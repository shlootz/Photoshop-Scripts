var defaultSettings = {
    ignoreHiddenLayers: false,
    ignoreBackground: true,
    writeTemplate: false,
    writeJson: true,
    scale: 1,
    padding: 1,
    imagesDir: "./assets/images/",
    jsonPath: "./assets/test.json",
};

var objectsInLayout = {};

var jsonPath = defaultSettings.jsonPath;

$.getJSON(jsonPath, function(json){
    var obj = json["slots"];
    var positions = json["skins"]["default"];
    for (i in obj){
        objectsInLayout[obj[i]["attachment"]] = {
            "name":String(obj[i]["attachment"]),
            "layer":obj[i]["layer"],
            "pos":positions[obj[i]["attachment"]][obj[i]["attachment"]]
        };
    }
    console.log(objectsInLayout);
});