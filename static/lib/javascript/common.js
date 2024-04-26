/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var commonOps = {
    initJSON: function (jsonfile) {
        fetch(jsonfile, {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
        })
                .then(response => response.json())
                .then(data => {
                    if (typeof initialDataFromService === 'undefined') {
                        initialData = data;
                    } else {
                        initialData = JSON.parse(initialDataFromService);
                    }
                    debugger;
                    listdata = initialData.layer_master;
                    return true;
                })
                .catch((error) => {
                    console.log(error);
                });
                return false;
    },
    createID: function () {
        return Array(16)
                .fill(0)
                .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
                .join('') +
                Date.now().toString(24);
    },
    createToastalert: function (title, message, type) {
        let toast = {
            title: title,
            message: message,
            timeout: 5000
        };
        Toast.create(toast);
    },
    escapeDown: function (e) {
        if (e.which == 27 && drawInteraction != null) {
            drawInteraction.removeLastPoint();
        }
    },
    interactions: {
        clearInteractions: function () {
            clearTempGeom();
            map.removeInteraction(drawInteraction);
            map.removeInteraction(snapInteraction);
            drawInteraction = null;
            snapInteraction = null;
            document.removeEventListener('keydown', escapeDown);
            if (pointerMoveSelectEvent !== null) {
                ol.Observable.unByKey(pointerMoveSelectEvent);
            }
            if (pointerClickSelectEvent != null) {
                ol.Observable.unByKey(pointerClickSelectEvent);
            }
        }
    },
    unbindPointerEvents: function () {
        if (pointerMoveSelectEvent !== null) {
            ol.Observable.unByKey(pointerMoveSelectEvent);
        }
        if (pointerClickSelectEvent != null) {
            ol.Observable.unByKey(pointerClickSelectEvent);
        }
    },
    removeFromArrayByAttr: function (arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i]
                    && arr[i].hasOwnProperty(attr)
                    && (arguments.length > 2 && arr[i][attr] === value)) {

                arr.splice(i, 1);
            }
        }
        return arr;
    },
    getDataById: function (type, id) {
        let reqData = generatedData[type];
        for (let i = 0; i < reqData.length; i++) {
            if (reqData[i].id === id) {
                return reqData[i];
            }
        }
    },
    GetFeature: function (layer, gettype, getvalue) {
        let listOffeatures = []

        let features = (eval(layer)).getSource().getFeatures();
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            if (feature.get(gettype) === getvalue) {
                listOffeatures.push(feature);
            }
        }
        if (listOffeatures.length > 0) {
            return listOffeatures;
        }
    },
    getData: function (funName) {
        funName(generatedData);
    },
    bulkDelete: function (type) {
        if (type === "lines") {
            let undoOpData = [];
            let redoOpData = [];
            let rawdata = $("#linestab").find("input[type=checkbox]:checked");
            rawdata.each(function (i, ele) {
                let id = $(ele).attr("id");
                if (id === "lnallchkbox") {
                    return;
                }
                undoOpData.push(getDataById("lines", id));
                redoOpData.push(id);
                removeLine(id);
            });
            geomOp.preDeleteLine(false, undoOpData, redoOpData);
        } else if (type === "points") {
            let undoOpData = [];
            let redoOpData = [];
            let rawdata = $("#pointstab").find("input[type=checkbox]:checked");
            rawdata.each(function (i, ele) {
                let id = $(ele).attr("id");
                if (id === "ptallchkbox") {
                    return;
                }
                undoOpData.push(getDataById("points", id));
                redoOpData.push(id);
                removePoint(id);
            });
            geomOp.preDeletePoint(false, undoOpData, redoOpData);
        } else if (type === "rawpoints") {
            let undoOpData = [];
            let redoOpData = [];
            let rawdata = $("#generatedpointstab").find("input[type=checkbox]:checked");
            rawdata.each(function (i, ele) {
                let id = $(ele).attr("id");
                if (id === "ptallchkbox") {
                    return;
                }
                undoOpData.push(getDataById("points", id));
                redoOpData.push(id);
                removerawPoint(id);
            });
            geomOp.preDeleterawPoint(false, undoOpData, redoOpData);
        } else {
            let undoOpData = [];
            let redoOpData = [];
            let rawdata = $("#polygonstab").find("input[type=checkbox]:checked");
            rawdata.each(function (i, ele) {
                let id = $(ele).attr("id");
                if (id === "ptallchkbox") {
                    return;
                }
                undoOpData.push(getDataById("points", id));
                redoOpData.push(id);
                removePoint(id);
            });
            var x;
        }
    },
    addGraticule: function () {
        if (graticule === null) {
            graticule = new ol.layer.Graticule({
                strokeStyle: new ol.style.Stroke({
                    color: 'rgba(255,120,0,0.9)',
                    width: 2,
                    lineDash: [0.3, 6],
                }),
                showLabels: true,
                wrapX: false,
            });
            try {
                map.addLayer(graticule);
            } catch (err) {
                console.log(err);
            }
        }
    },
    removeGraticule: function () {
        if (graticule !== null) {
            map.removeLayer(graticule);
            graticule = null;
        }
    }

};
var UndoRedo = {
    logActions: function (data) {
        undoStack.push({
            "undoOp": {"data": data.undoOp, "type": data.type, "action": data.action},
            "redoOp": {"data": data.redoOp, "type": data.type, "action": data.action}
        });
    },
    doUndo: function () {
        let operData = undoStack.pop();
        if (operData && operData.undoOp) {
            redoStack.push(operData);
            let undoOpDetails = operData.undoOp;
            switch (undoOpDetails.type) {
                case "point":
                    var undoOpDetailsData = undoOpDetails.data;
                    if (undoOpDetails.action === "create") {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            removePoint(undoOpDetailsData[i]);
                        }
                    } else {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            createPoint(undoOpDetailsData[i].name, undoOpDetailsData[i].geom, POINTTYPE.CREATED, undoOpDetailsData[i].id);
                        }
                    }
                    refreshPointsInDataDisplay();
                    break;
                case "line":
                    var undoOpDetailsData = undoOpDetails.data;
                    if (undoOpDetails.action === "create") {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            removeLine(undoOpDetailsData[i]);
                        }
                    } else {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            createLine(undoOpDetailsData[i].geom, LINETYPE.CREATED, undoOpDetailsData[i].id);
                        }
                    }
//                    split();
                    refreshLinesInDataDisplay();
                    break;
                case "etspoint":
                    var undoOpDetailsData = undoOpDetails.data;
                    if (undoOpDetails.action === "create") {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            removerawPoint(undoOpDetailsData[i]);
                        }
                    } else {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            createRawPoints(undoOpDetailsData[i].name, undoOpDetailsData[i].geom, POINTTYPE.CREATED, undoOpDetailsData[i].id);
                        }
                    }
                    refreshrawPointsInDataDisplay();
                    break;
                case "polygon":

                    break;
            }
        }
    },
    doRedo: function () {
        let operData = redoStack.pop();
        if (operData && operData.redoOp) {
            undoStack.push(operData);
            let redoOpDetails = operData.redoOp;
            switch (redoOpDetails.type) {
                case "point":
                    var redoOpDetailsData = redoOpDetails.data;
                    if (redoOpDetails.action === "create") {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            createPoint(redoOpDetailsData[i].name, redoOpDetailsData[i].geom, POINTTYPE.CREATED, redoOpDetailsData[i].id);
                        }
                    } else {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            removePoint(redoOpDetailsData[i]);
                        }
                    }
                    refreshPointsInDataDisplay();
                    break;
                case "line":
                    var redoOpDetailsData = redoOpDetails.data;
                    if (redoOpDetails.action === "create") {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            createLine(redoOpDetailsData[i].geom, LINETYPE.CREATED, redoOpDetailsData[i].id);
                        }
                    } else {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            removeLine(redoOpDetailsData[i]);
                        }
                    }
//                    split();
                    refreshLinesInDataDisplay();
                    break;
                case "etspoint":
                    var redoOpDetailsData = redoOpDetails.data;
                    if (redoOpDetails.action === "create") {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            createRawPoints(redoOpDetailsData[i].name, redoOpDetailsData[i].geom, POINTTYPE.CREATED, redoOpDetailsData[i].id);
                        }
                    } else {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            removerawPoint(redoOpDetailsData[i]);
                        }
                    }
                    refreshrawPointsInDataDisplay();
                    break;
            }
        }
    }
};
var highlightOp = {
    doHighlight: function (id, type, flag) {
        debugger;
        if (type === "lines") {
            if (!id) {
                if ($("#lnallchkbox").is(":checked")) {
//                    $("#linestab").find("input[name='lnchkbox']").prop("checked", true);
                    $("#linestab").find("input[name='lnchkbox']").each(function (i, data) {
                        $(data).prop("checked", true);
                        let name = $(data).attr("custname");
                        let ft = GetFeature(LAYERTYPE.LINES, LAYERGETTYPE.NAME, name);
                        for (let i = 0; i < ft.length; i++) {
                            tempLayer.getSource().addFeature(ft[i]);
                        }
                    });
                } else {
//                    $("#linestab").find("input[name='lnchkbox']").prop("checked", false);
                    $("#linestab").find("input[name='lnchkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let name = $(data).attr("custname");
                        let ft = GetFeature(LAYERTYPE.LINES, LAYERGETTYPE.NAME, name);
                        for (let i = 0; i < ft.length; i++) {
                            tempLayer.getSource().removeFeature(ft[i]);
                        }
                    });
                }
            } else {
                let name = '';
                for (var t = 0; t < linegridData.length; t++) {
                    if (id === linegridData[t].id) {
                        name = linegridData[t].name;
                        break;
                    }
                }

                if (flag) {
                    let ft = GetFeature(LAYERTYPE.LINES, LAYERGETTYPE.NAME, name);
                    for (let i = 0; i < ft.length; i++) {
                        tempLayer.getSource().addFeature(ft[i]);
                    }
                } else {
                    let ft = GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.NAME, name);
                    for (let i = 0; i < ft.length; i++) {
                        tempLayer.getSource().removeFeature(ft[i]);
                    }
                }
            }
        } else if (type === "polygons") {
            if (!id) {
                if ($("#polyallchkbox").is(":checked")) {
                    $("#polygonstab").find("input[name='polychkbox']").each(function (i, data) {
                        $(data).prop("checked", true);
                        let id = $(data).attr("id");
                        let ft = GetFeature(LAYERTYPE.POLYGON, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().addFeature(ft[0]);
                    });
                } else {
                    $("#polygonstab").find("input[name='polychkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let id = $(data).attr("id");
                        let ft = GetFeature(LAYERTYPE.POLYGON, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().removeFeature(ft[0]);
                    });
                }
            } else {
                if (flag) {
                    let ft = GetFeature(LAYERTYPE.POLYGON, LAYERGETTYPE.ID, id);
                    let f1 = ft[0].clone();
                    tempLayer.getSource().addFeature(f1);
                } else {
                    let ft = GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.ID, id);
                    tempLayer.getSource().removeFeature(ft[0]);
                }
            }
        } else if (type === "raw") {
            //Aravind created this to add highlight feature-- from this to..
            if (!id) {
                if ($("#rawptallchkbox").is(":checked")) {
                    $("#generatedpointstab").find("input[name='rawptchkbox']").each(function (i, data) {
                        $(data).prop("checked", true);
                        let id = $(data).attr("id");
                        let ft = GetFeature("etsLayer", LAYERGETTYPE.ID, id);
                        tempLayer.getSource().addFeature(ft[0]);
                    });
                } else {
                    $("#generatedpointstab").find("input[name='rawptchkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let id = $(data).attr("id");
                        let ft = GetFeature("etsLayer", LAYERGETTYPE.ID, id);
                        tempLayer.getSource().removeFeature(ft[0]);
                    });
                }
            } else {
                if ($("#" + id).is(":checked")) {
                    let ft = GetFeature("etsLayer", LAYERGETTYPE.ID, id);
                    let f1 = ft[0].clone();
                    tempLayer.getSource().addFeature(f1);
                } else {
                    let ft = GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.ID, id);
                    try {
                        tempLayer.getSource().removeFeature(ft[0]);
                    } catch (err) {
                        console.log("Error on ..removefeature rawSection  " + err);

                    }
                }
            }

            if ($("#generatedpointstab").find("input[type=checkbox]:checked").length > 0) {
                $("#rawptDeleteBtn").removeClass("DN");
            } else {
                $("#rawptDeleteBtn").addClass("DN");
            }
            //--this.
        } else {
            if (!id) {
                if ($("#ptallchkbox").is(":checked")) {
                    $("#pointstab").find("input[name='ptchkbox']").each(function (i, data) {
                        $(data).prop("checked", true);
                        let id = $(data).attr("id");
                        let ft = GetFeature(LAYERTYPE.POINTS, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().addFeature(ft[0]);
                    });
                } else {
                    $("#pointstab").find("input[name='ptchkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let id = $(data).attr("id");
                        let ft = GetFeature(LAYERTYPE.POINTS, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().removeFeature(ft[0]);
                    });
                }
            } else {
                if (flag) {
                    let ft = GetFeature(LAYERTYPE.POINTS, LAYERGETTYPE.ID, id);
                    let f1 = ft[0].clone();
                    tempLayer.getSource().addFeature(f1);
                } else {
                    let ft = GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.ID, id);
                    tempLayer.getSource().removeFeature(ft[0]);
                }
            }

            if ($("#pointstab").find("input[type=checkbox]:checked").length > 0) {
                $("#ptDeleteBtn").removeClass("DN");
            } else {
                $("#ptDeleteBtn").addClass("DN");
            }
        }
    },
    doCheckUncheck: function (id, type) {
        if (type === "lines") {
            if (id) {
                $("#linestab").find("#" + id).prop("checked", true);
                $("#lnDeleteBtn").removeClass("DN");
            }
        } else {
            if (id) {
                $("#pointstab").find("#" + id).prop("checked", true);
                $("#ptDeleteBtn").removeClass("DN");
                try {
                    $("#generatedpointstab").find("#" + id).prop("checked", true);
                    $("#rawptDeleteBtn").removeClass("DN");
                } catch (err) {
                    console.log("Error while populating genetateddata..  " + err);
                }
            }
        }
    }
};
