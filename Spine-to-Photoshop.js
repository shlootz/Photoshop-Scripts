var utilities = document.createElement('script');
utilities.src = 'lib/utilities.js';
document.head.appendChild(utilities);

var underscore = document.createElement('script');
utilities.src = 'lib/underscore.js';
document.head.appendChild(underscore);

var json2 = document.createElement('script');
json2.src = 'lib/utilities.js';
document.head.appendChild(json2);

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