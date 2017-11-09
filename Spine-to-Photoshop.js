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

var jsonPath = defaultSettings.jsonPath;

$.getJSON(jsonPath, function(json){
    for (i in json){
        console.log(i, " ",json[i]);
    }
});