﻿if (typeof PRELOADER_VALIDATOR !== "object") {    PRELOADER_VALIDATOR = {};}(function () {        var rootModelDesktop = {            PreloaderModuleAssets:true        }        if (typeof PRELOADER_VALIDATOR.validate !== "function") {        meta = {    // table of character substitutions            "\b": "\\b",            "\t": "\\t",            "\n": "\\n",            "\f": "\\f",            "\r": "\\r",            "\"": "\\\"",            "\\": "\\\\"        };        PRELOADER_VALIDATOR.validate = function (mode, json){        switch (mode){               case "desktop":                    PRELOADER_DESKTOP_MODEL.populate();                    return validateDesktop(json, PRELOADER_DESKTOP_MODEL);                    break;                               case "mobile_portrait":                    return validateMobileLandscape(json);                    break;                                case "mobile_landscape":                    break;                                default:                    return validateMobilePortrait(json);                    break;            }        }    }    function validateDesktop(json, model){                    var passes = [true];            var slots = json["slots"];                        for(var key in slots){                   var depth = slots[key]["layer"].replace(/[^\/]/g, "").length;                   var tree = slots[key]["layer"].split("/");                   var root = tree[0];                }                        for(var i = 0; i<model.layers.length; i++){                var found = false;                 for(var key in slots){                          if(model.layers[i] === slots[key]["layer"]){                              found = true;                          }                     }                 if(!found){                    var result = confirm ("You are missing the "+model.layers[i]+" group from your file! Continue?", true, "Missing Photoshop Groups");                             if(!result) {                                 return "canceled";                             }                    }                 passes.push(found);                 }                        return evaluate(passes);        }    function validateMobileLandscape(json){            var valid = false;            return valid;        }    function validateMobilePortrait(json){            var valid = false;            return valid;        }        function evaluate(passes){        var result = true;        for (var i = 0; i<passes.length; i++){            if(passes[i] === false){                    result = false;                }            }                return result;        }   })();//////////////// MODELS ////////////////PRELOADER_DESKTOP_MODEL = {};PRELOADER_DESKTOP_MODEL.populate = function(){        var layers=[];    layers.push("PreloaderModuleAssets/");    layers.push("PreloaderModuleAssets/content/");    layers.push("PreloaderModuleAssets/background/");        PRELOADER_DESKTOP_MODEL.layers = layers;    }