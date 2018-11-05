﻿if (typeof NO_VALIDATOR !== "object") {    NO_VALIDATOR = {};}(function () {        var rootModelDesktop = {            PreloaderModuleAssets:true        }        if (typeof NO_VALIDATOR.validate !== "function") {        meta = {    // table of character substitutions            "\b": "\\b",            "\t": "\\t",            "\n": "\\n",            "\f": "\\f",            "\r": "\\r",            "\"": "\\\"",            "\\": "\\\\"        };        NO_VALIDATOR.validate = function (mode, json){        switch (mode){               case "desktop":                    NO_VALIDATOR.DESKTOP_MODEL.populate();                    return validate(json, NO_VALIDATOR.DESKTOP_MODEL);                    break;                               case "mobile_portrait":                    NO_VALIDATOR.PORTRAIT_MODEL.populate();                    return validate(json, NO_VALIDATOR.PORTRAIT_MODEL);                    break;                                case "mobile_landscape":                    NO_VALIDATOR.LANDSCAPE_MODEL.populate();                     return validate(json, NO_VALIDATOR.LANDSCAPE_MODEL);                    break;                                default:                    confirm ("File name missing 'desktop', 'mobile_portrait' or 'mobile_landscape' Continue?", true, "No validator for this file.");                    if(!result) {                                 return "canceled";                             }                    break;            }        }    }    function validate(json, model){                    var passes = [true];            var slots = json["slots"];                        for(var key in slots){                   var depth = slots[key]["layer"].replace(/[^\/]/g, "").length;                   var tree = slots[key]["layer"].split("/");                   var root = tree[0];                                       slots[key]["layer"] =  slots[key]["layer"].toLowerCase();                }                        for(var i = 0; i<model.layers.length; i++){                var found = false;                 for(var key in slots){                            if(slots[key]["layer"].indexOf(model.layers[i].toLowerCase()) != -1){                              found = true;                          }                     }                 if(!found){                    var result = confirm ("You are missing the "+model.layers[i]+" group from your file! Continue?", true, "Missing Photoshop Groups");                             if(!result) {                                 return "canceled";                             }                    }                 passes.push(found);                 }                        return evaluate(passes);        }        function evaluate(passes){        var result = true;        for (var i = 0; i<passes.length; i++){            if(passes[i] === false){                    result = false;                }            }                return result;        }   })();//////////////// MODELS //////////////////////////////// DESKTOP ///////////////NO_VALIDATOR.DESKTOP_MODEL = {};NO_VALIDATOR.DESKTOP_MODEL.populate = function(){        var layers=[];    //layers.push("PreloaderModuleAssets/content/");    //layers.push("PreloaderModuleAssets/background/");        NO_VALIDATOR.DESKTOP_MODEL.layers = layers;    }//////////////// LANDSCAPE MOBILE ///////////////NO_VALIDATOR.LANDSCAPE_MODEL = {};NO_VALIDATOR.LANDSCAPE_MODEL.populate = function(){        var layers=[];    //fail test    //layers.push("PreloaderModuleAssets/Main_landscape/content/");    //layers.push("PreloaderModuleAssets/Main_landscape/background/");        NO_VALIDATOR.LANDSCAPE_MODEL.layers = layers;    }//////////////// PORTRAIT MOBILE ///////////////NO_VALIDATOR.PORTRAIT_MODEL = {};NO_VALIDATOR.PORTRAIT_MODEL.populate = function(){        var layers=[];    //fail test    //layers.push("PreloaderModuleAssets/Main_Portrait/content/");    l//ayers.push("PreloaderModuleAssets/Main_Portrait/background/");        NO_VALIDATOR.PORTRAIT_MODEL.layers = layers;    }