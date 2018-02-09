﻿#target photoshop#include "json2.js"app.bringToFront();// This script exports Adobe Photoshop layers as individual PNGs. It also// writes a JSON file which can be imported into Spine where the images// will be displayed in the same positions and draw order.// Copyright (c) 2012-2017, Esoteric Software// All rights reserved.// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met://     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.//     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.//     * Neither the name of Esoteric Software nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.var cs2 = parseInt(app.version) < 10;var originalDoc;try {	originalDoc = app.activeDocument;} catch (ignored) {}var myFile = File.openDialog("Selection prompt");var pathToJSON = (myFile.path)+"/"+String(myFile.name).replace(".psd", ".json"); var scriptFile = File(pathToJSON);   scriptFile.open('r');   var content = scriptFile.read();    scriptFile.close();     var masterJSON = JSON.parse(content);$.writeln(JSON.parse(content));