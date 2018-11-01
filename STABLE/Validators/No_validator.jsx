﻿if (typeof NO_VALIDATOR !== "object") {    NO_VALIDATOR = {};}(function () {        var rootModelDesktop = {            PreloaderModuleAssets:true        }        if (typeof NO_VALIDATOR.validate !== "function") {        meta = {    // table of character substitutions            "\b": "\\b",            "\t": "\\t",            "\n": "\\n",            "\f": "\\f",            "\r": "\\r",            "\"": "\\\"",            "\\": "\\\\"        };        NO_VALIDATOR.validate = function (mode, json){        switch (mode){               case "desktop":                    DESKTOP_MODEL.populate();                    return validate(json, DESKTOP_MODEL);                    break;                               case "mobile_portrait":                    PORTRAIT_MODEL.populate();                    return validate(json, PORTRAIT_MODEL);                    break;                                case "mobile_landscape":                    LANDSCAPE_MODEL.populate();                     return validate(json, LANDSCAPE_MODEL);                    break;                                default:                    confirm ("File name missing 'desktop', 'mobile_portrait' or 'mobile_landscape' Continue?", true, "No validator for this file.");                    if(!result) {                                 return "canceled";                             }                    break;            }        }    }    function validate(json, model){                    var passes = [true];            var slots = json["slots"];                        for(var key in slots){                   var depth = slots[key]["layer"].replace(/[^\/]/g, "").length;                   var tree = slots[key]["layer"].split("/");                   var root = tree[0];                }                        for(var i = 0; i<model.layers.length; i++){                var found = false;                 for(var key in slots){                          if(model.layers[i] === slots[key]["layer"]){                              found = true;                          }                     }                 if(!found){                    var result = confirm ("You are missing the "+model.layers[i]+" group from your file! Continue?", true, "Missing Photoshop Groups");                             if(!result) {                                 return "canceled";                             }                    }                 passes.push(found);                 }                        return evaluate(passes);        }        function evaluate(passes){        var result = true;        for (var i = 0; i<passes.length; i++){            if(passes[i] === false){                    result = false;                }            }                return result;        }   })();//////////////// MODELS //////////////////////////////// DESKTOP ///////////////DESKTOP_MODEL = {};DESKTOP_MODEL.populate = function(){        var layers=[];    //layers.push("PreloaderModuleAssets/content/");    //layers.push("PreloaderModuleAssets/background/");        DESKTOP_MODEL.layers = layers;    }//////////////// LANDSCAPE MOBILE ///////////////LANDSCAPE_MODEL = {};LANDSCAPE_MODEL.populate = function(){        var layers=[];    //fail test    //layers.push("PreloaderModuleAssets/Main_landscape/content/");    //layers.push("PreloaderModuleAssets/Main_landscape/background/");        LANDSCAPE_MODEL.layers = layers;    }//////////////// PORTRAIT MOBILE ///////////////PORTRAIT_MODEL = {};PORTRAIT_MODEL.populate = function(){        var layers=[];    //fail test    //layers.push("PreloaderModuleAssets/Main_Portrait/content/");    l//ayers.push("PreloaderModuleAssets/Main_Portrait/background/");        PORTRAIT_MODEL.layers = layers;    }