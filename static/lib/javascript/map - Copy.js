/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//contains only map and layer initialization  function

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const servicePathPanel = "lib/jspanel/components/";
const servicePath = "";
const _wktFormat = new ol.format.WKT();
const _jstsReader = new jsts.io.WKTReader();
const POINTTYPE = {VERTEX: "V", CREATED: "C"};
const ALERTS = {SUCCESS: "S", WARNING: "W", ERROR: "E"};
const LINETYPE = {BOUNDARY: "B", CREATED: "C"};
const POLYGONTYPE = {INITIAL: "I", CREATED: "C"};
const LAYERTYPE = {LINES: "vectorLines", POINTS: "vectorPoints", TEMP: "tempLayer", POLYGON: "vectorPolygon"};
const LAYERGETTYPE = {ID: "id", NAME: "name"};
let initialData = null;
let listdata = null;
var xarray = [];
let map = null;
let loadedData = "points";
let vectorLineLayer = null;
let vectorPolygon = null;
let vectorPoints = null;
let vectorLines = null;
//let vectorLineSegmants = null;
let tempLayer = null;
let etsLayer = null;
let generatedrawdata = [];
//pickFlag act as a flag for picking the point from the ets data
let pickFlag = true;
let flagFirstline = true;
let linestr = "LINESTRING(";
let polystr = "POLYGON((";
let borderLineData = [];
let referencePoints = [];
//let createdLines = [];
let previousline = null;
let generatedData = {points: [], lines: [], polygons: [], ETSdata: []};
let generatedPolygons = [];
let boundaryLine = null;
let drawnFeatures = null;
let homepaagetoolbar = '';
let drawInteraction = null;
let snapInteraction = null;
let panelPointOnLine = null;
let panelArcPoint = null;
let panelPoint = null;
let pointtype, category;
let insertpointPnel = null;
let insertlinePanel = null;
let attjsPanel = null;
let lineTabHtml = '';
let generatedDataPanel = null;
let pointerMoveSelectEvent = null;
let pointerClickSelectEvent = null;
const OPERATION = {POINT: "point", LINE: "line", ETSPOINT: "etspoint", POLYGON: "polygon"};
const ACTION = {CREATE: "create", DELETE: "delete"};
let undoStack = [];
let redoStack = [];
let graticule = null;
var importPanelHeight = null;
var importPanelWidth = null;
var grid = null;
var linegrid = null;
var polygrid = null;
var pointgridData = [];
var linegridData = [];
var polygongridData = [];

const Maps = {
    MapOps: {
        initMaps: function () {
            let features = []; //for polygon
            let ptFeatures = []; //for points
            let lnFeatures = []; //for lines
            if (vectorPoints === null) {//initializing the vectorpoints
                vectorPoints = new ol.layer.Vector({
                    name: "vectorPoints",
                    source: new ol.source.Vector({
                        features: ptFeatures
                    }),
                    style: function (feature, resolution) {
                        return new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 10,
                                fill: (feature.get("category") === "V") ? new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}) : new ol.style.Fill({color: 'rgba(0, 0, 200, 0.2)'}),
                                stroke: (feature.get("category") === "V") ? new ol.style.Stroke({color: 'red', width: 1}) : new ol.style.Stroke({color: 'blue', width: 1}),
                            }),
                            text: new ol.style.Text({
                                textAlign: 'center',
                                textBaseline: 'middle',
                                text: feature.get('name'),
                                fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.7)'}),
                                stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 0.7)', width: 1}),
                                offsetX: 2,
                                offsetY: 2
                            })
                        });
                    }
                });
            }
            if (vectorLines === null) {//initializing vectorlines
                vectorLines = new ol.layer.Vector({
                    name: "vectorLines",
                    source: new ol.source.Vector({
                        features: lnFeatures
                    }),
                    style: function (feature, resolution) {
                        return new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                width: 1,
                                color: [45, 32, 208, 0.8], //237, 212, 0, 0.8
                            }),
                            text: new ol.style.Text({
                                placement: 'line',
                                textBaseline: 'bottom',
                                text: feature.get('length'),
                                fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.7)'}),
                            })
                        });
                    }
                });
            }
            if (vectorPolygon === null) {//initializing vectorpolygon
                vectorPolygon = new ol.layer.Vector({
                    name: "vectorPolygon",
                    source: new ol.source.Vector({
                        features: features
                    }),
                    style: function (feature, resolution) {
                        return new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'blue',
                                width: 1,
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(0, 200, 0, 0.1)',
                            }),
                            text: new ol.style.Text({
                                overflow: true,
                                fill: new ol.style.Fill({
                                    color: '#000',
                                }),
                                text: feature.get('name'),
                                stroke: new ol.style.Stroke({
                                    color: '#fff',
                                    width: 3
                                })
                            })
                        }
                        );
                    }
                });
            }
            if (tempLayer === null) { //initialize templayer
                tempLayer = new ol.layer.Vector({
                    name: 'tempLayer',
                    source: new ol.source.Vector(),
                    style: function (feature, resolution) {
                        var styles = [
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: 'rgba(0, 0, 200, 0.5)',
                                    width: 3
                                }),
                                text: new ol.style.Text({
                                    text: '' + feature.get('name'),
                                    rotation: (feature.get('angle')) ? feature.get('angle') : 0
                                }),
                                image: new ol.style.Icon({
                                    anchor: [0.5, 46],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'pixels',
                                    src: 'assets/anchor.png'
                                })
                            })];
                        return styles;
                    }
                });
            }
            if (etsLayer === null) {//initializing the ETS Layer
                etsLayer = new ol.layer.Vector({
                    name: 'etsLayer',
                    source: new ol.source.Vector(),
                    style: function (feature, resolution) {
                        var styles = [
                            new ol.style.Style({
                                text: new ol.style.Text({
                                    text: '' + feature.get('name'),
                                    fill: new ol.style.Fill({
                                        color: 'black'
                                    }),
                                    offsetY: 15,
                                    rotation: (feature.get('angle')) ? feature.get('angle') : 0
                                }),
                                image: new ol.style.Circle({
                                    radius: 6,
                                    stroke: new ol.style.Stroke({
                                        color: 'rgba(232, 107, 108, 0.8)',
                                        width: 4
                                    })
                                })
                            })];
                        return styles;
                    }
                });
            }
            const mousePositionControl = new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.createStringXY(4),
                projection: 'EPSG:900914',
                // comment the following two lines to have the mouse position
                // be placed within the map.
                className: 'custom-mouse-position',
                target: document.getElementById('mouse-position'),
            });
            if (map === null) {//initalizing the map
                map = new ol.Map({
                    controls: ol.control.defaults().extend([mousePositionControl]),
                    layers: [vectorPolygon, vectorLines, vectorPoints, etsLayer, tempLayer],
                    target: 'map',
                    view: new ol.View({
                    })
                });
            }
            //key binidings for shorctcut actions
            $(document).keydown(function (event) {
                if (event.ctrlKey && event.which === 89) {
                    UndoRedo.doRedo();
                    event.preventDefault();
                } else if (event.ctrlKey && event.which === 90)
                {
                    UndoRedo.doUndo();
                    event.preventDefault();
                }
            });
        },
    }
};

var geomOp = {
    initGrids: function () {
        var griddiv = document.getElementById('grid');
        griddiv.innerHTML = "";
        grid = new tui.Grid({
            el: document.getElementById('grid'),
            data: pointgridData,
            rowHeaders: ['checkbox'],
            scrollX: false,
            scrollY: false,
            columns: [
                {
                    header: 'Actions',
                    name: 'actions'
                },
                {
                    header: 'SL NO',
                    name: 'slno'
                },
                {
                    header: 'Name',
                    name: 'name'
                },
                {
                    header: 'Details',
                    name: 'details'
                }
            ]
        });
        grid.on('check', ev => {
            //alert('Checked' + pointgridData[ev["rowKey"]].name);
            highlightOp.doHighlight(pointgridData[ev["rowKey"]].id, loadedData, true);
        });
        grid.on('uncheck', ev => {
            highlightOp.doHighlight(pointgridData[ev["rowKey"]].id, loadedData, false);
        });
        grid.on('focusChange', ev => {
            console.log('change focused cell!', ev);
        });
        var griddivline = document.getElementById('linesData');
        griddivline.innerHTML = "";
        linegrid = new tui.Grid({
            el: document.getElementById('linesData'),
            data: pointgridData,
            rowHeaders: ['checkbox'],
            scrollX: false,
            scrollY: false,
            columns: [
                {
                    header: 'Actions',
                    name: 'actions'
                },
                {
                    header: 'SL NO',
                    name: 'slno'
                },
                {
                    header: 'Name',
                    name: 'name'
                },
                {
                    header: 'Details',
                    name: 'details'
                }
            ]
        });
        linegrid.on('check', ev => {
            //alert('Checked' + pointgridData[ev["rowKey"]].name);
            highlightOp.doHighlight(linegridData[ev["rowKey"]].id, 'lines', true);
        });
        linegrid.on('uncheck', ev => {
            highlightOp.doHighlight(linegridData[ev["rowKey"]].id, 'lines', false);
        });
        linegrid.on('focusChange', ev => {
            console.log('change focused cell!', ev);
        });
        var griddivpoly = document.getElementById('PolygonData');
        griddivpoly.innerHTML = "";
        polygrid = new tui.Grid({
            el: document.getElementById('PolygonData'),
            data: pointgridData,
            rowHeaders: ['checkbox'],
            scrollX: false,
            scrollY: false,
            columns: [
                {
                    header: 'Actions',
                    name: 'actions'
                },
                {
                    header: 'SL NO',
                    name: 'slno'
                },
                {
                    header: 'Name',
                    name: 'name'
                },
                {
                    header: 'Details',
                    name: 'details'
                }
            ]
        });
        polygrid.on('check', ev => {
            //alert('Checked' + pointgridData[ev["rowKey"]].name);
            highlightOp.doHighlight(polygongridData[ev["rowKey"]].id, 'polygons', true);
        });
        polygrid.on('uncheck', ev => {
            highlightOp.doHighlight(polygongridData[ev["rowKey"]].id, 'polygons', false);
        });
        polygrid.on('focusChange', ev => {
            console.log('change focused cell!', ev);
        });
    },
    preDeleterawPoint: function (logDataForDeleteid, undoOpData, redoOpdata) {
        if (confirm("Are you sure to delete the selected raw data?")) {
            if (logDataForDeleteid) {
                undoOpData = [commonOps.getDataById("points", logDataForDeleteid)];
                redoOpdata = [logDataForDeleteid];
                geomOp.removerawPoint(logDataForDeleteid);
            }
            let logData = {
                "undoOp": undoOpData,
                "redoOp": redoOpdata,
                "type": OPERATION.ETSPOINT,
                "action": ACTION.DELETE
            };
            UndoRedo.logActions(logData);
            panelOps.basePointPanel.refreshetsPoints();
        }
    },
    preDeletePoint: function (logDataForDeleteid, undoOpData, redoOpdata) {
        if (confirm("Are you sure to delete the selected data?")) {
            if (logDataForDeleteid) {
                undoOpData = [commonOps.getDataById("points", logDataForDeleteid)];
                redoOpdata = [logDataForDeleteid];
                geomOp.removePoint(logDataForDeleteid);
            }
            let logData = {
                "undoOp": undoOpData,
                "redoOp": redoOpdata,
                "type": OPERATION.POINT,
                "action": ACTION.DELETE
            };
            UndoRedo.logActions(logData);
            panelOps.commonOps.refreshPointsInDataDisplay();
        }
    },
    precreatePolygon: function (id) {
        panelOps.commonOps.refreshPolygonsInDataDisplay();
    },
    predeletePolygon: function (id) {
        panelOps.commonOps.refreshPolygonsInDataDisplay();
    },
    preDeleteLine: function (logDataForDeleteid, undoOpData, redoOpdata) {
        if (confirm("Are you sure to delete the selected data?")) {
            if (logDataForDeleteid) {
                undoOpData = [commonOps.getDataById("lines", logDataForDeleteid)];
                redoOpdata = [logDataForDeleteid];
                geomOp.removeLine(logDataForDeleteid);
            }
            let logData = {
                "undoOp": undoOpData,
                "redoOp": redoOpdata,
                "type": OPERATION.LINE,
                "action": ACTION.DELETE
            };
            UndoRedo.logActions(logData);
            panelOps.commonOps.refreshLinesInDataDisplay();
        }
    },
    preCreateRawPoint: function (logDataForCreate, undoOpData, redoOpData) {

        if (logDataForCreate) {
            let id = geomOp.createRawPoints(logDataForCreate.name, logDataForCreate.geom, logDataForCreate.type);
            undoOpData = [id];
            redoOpData = [{"name": logDataForCreate.name, "geom": logDataForCreate.geom, "type": logDataForCreate.type, "id": id}];
        }
        let logData = {
            "undoOp": undoOpData,
            "redoOp": redoOpData,
            "type": OPERATION.ETSPOINT,
            "action": ACTION.CREATE
        };
        UndoRedo.logActions(logData);
        try {
            panelPoint.close();
            panelPoint = null;
            commonOps.createToastalert("Successfull", "Successfully imported the data", ALERTS.SUCCESS);
        } catch (err) {
            console.log(" Error while closing the Import panel " + err);
            commonOps.createToastalert("Error", "Something went wrong while importing the data", ALERTS.ERROR);
        }
        panelOps.basePointPanel.refreshetsPoints();
    },
    preCreatePoint: function (logDataForCreate, undoOpData, redoOpData) {
        if (logDataForCreate) {
            let id = geomOp.createPoint(logDataForCreate.name, logDataForCreate.geom, logDataForCreate.type);
            undoOpData = [id];
            redoOpData = [{"name": logDataForCreate.name, "geom": logDataForCreate.geom, "type": logDataForCreate.type, "id": id}];
        }
        let logData = {
            "undoOp": undoOpData,
            "redoOp": redoOpData,
            "type": OPERATION.POINT,
            "action": ACTION.CREATE
        };
        UndoRedo.logActions(logData);
        panelOps.commonOps.refreshPointsInDataDisplay();
    },
    preCreateLine: function (logDataForCreate, undoOpData, redoOpData) {
        if (logDataForCreate) {
            let generatedLine = geomOp.createLine(logDataForCreate.geom, logDataForCreate.type);
            undoOpData = [generatedLine.id];
            redoOpData = [{"name": generatedLine.name, "geom": logDataForCreate.geom, "type": logDataForCreate.type, "id": generatedLine.id}];
        }
        let logData = {
            "undoOp": undoOpData,
            "redoOp": redoOpData,
            "type": OPERATION.LINE,
            "action": ACTION.CREATE
        };
        UndoRedo.logActions(logData);
        panelOps.commonOps.refreshLinesInDataDisplay();
    },
    createTempLine: function (c1, c2) {
        let lName = "L" + (generatedData.lines.length + 1);
        let lns = new ol.geom.LineString([c1, c2]);
        debugger;
        let lnFeature = new ol.Feature({
            geometry: lns,
            name: lName,
            category: LINETYPE.CREATED,
            length: "" + lns.getLength().toFixed(2),
            id: commonOps.createID(),
            type: 'LN'

        });
        vectorLineLayer.getSource().addFeature(lnFeature);
    },
    highlightFeature: function () {
        commonOps.interactions.clearInteractions();
        pointerMoveSelectEvent = map.on('pointermove', function (e) {

            geomOp.clearTempGeom();
            map.forEachFeatureAtPixel(e.pixel, function (feature) {
                if (feature) {

                    var ty = feature.get("type");
                    if (ty === 'PT') {
                        if (feature.get("category") === POINTTYPE.CREATED) {
                            if (tempLayer.getSource().getFeatures().length === 0) {
                                let f1 = feature.clone();
                                // f1.unset('type', true);
                                tempLayer.getSource().addFeature(f1);
                            }
                        }

                    } else if (ty === 'LN') {

                        if (feature.get("category") === LINETYPE.CREATED) {
                            let lineName = feature.get("name");
                            for (i = 0; i < vectorLines.getSource().getFeatures().length; i++) {
                                if (vectorLines.getSource().getFeatures()[i].get("name") === lineName) {
                                    let f1 = vectorLines.getSource().getFeatures()[i].clone();
                                    tempLayer.getSource().addFeature(f1);
                                }

                            }

                        }
                    }
                }
            },
                    {
                        layerFilter: function (layer) {
                            return (layer.get('name') === 'vectorPoints' || layer.get('name') === 'vectorLines' || layer.get('name') === 'etsLayer');//added etsLayer on the filter, sothat the highlight will workon etsLayer also
                        }
                    }
            );
        });
        pointerClickSelectEvent = map.on('singleclick', function (e) {
            map.forEachFeatureAtPixel(e.pixel, function (feature) {
                if (feature) {
//                console.log(feature.get("id") + " - " + feature.get("name") + " - " + feature.get("type"));
                    var ty = feature.get("type");
                    if (ty === 'PT') {
                        if (feature.get("category") === POINTTYPE.CREATED) {
                            commonOps.unbindPointerEvents();
                            highlightOp.doCheckUncheck(feature.get("id"), "points");
//                        geomOp.preDeletePoint(feature.get("id"));
                        }

                    } else if (ty === 'LN') {

                        if (feature.get("category") === POINTTYPE.CREATED) {
                            commonOps.unbindPointerEvents();
                            highlightOp.doCheckUncheck(feature.get("id"), "lines");
//                        geomOp.preDeleteLine(feature.get("id"));
                        }
                    }
                }

            },
                    {
                        layerFilter: function (layer) {
                            return (layer.get('name') === 'vectorPoints' || layer.get('name') === 'vectorLines' || layer.get('name') === 'etsLayer'); //added etsLayer on the filter, sothat the highlight will workon etsLayer also
                        }
                    }
            );
        });
    },
    createPoint: function (ptName, wktPoint, type, preFilledId) {
        let id = preFilledId;
        if (!id) {
            id = commonOps.createID();
        }
        let ptFeature = new ol.Feature({
            geometry: _wktFormat.readGeometry(wktPoint),
            name: ptName,
            category: type,
            line: -1,
            id: id,
            type: 'PT'
        });
        vectorPoints.getSource().addFeature(ptFeature);
        referencePoints.push({"name": ptName, "geom": wktPoint, id: id});
        generatedData.points.push({"name": ptName, "geom": wktPoint, id: id});
        var tlem = pointgridData.length;
        pointgridData.push({"id": id, "actions": '<button onclick="someFunction(this)">check</button>', "slno": tlem + 1, "name": ptName, "geom": wktPoint, "details": category + " - " + pointtype});
        return id;
    },
    createRawPoints: function (ptName, wktPoint, type, preFilledId) {
        let id = preFilledId;
        if (!id) {
            id = commonOps.createID();
        }
        let ptFeature = new ol.Feature({
            geometry: _wktFormat.readGeometry(wktPoint),
            name: ptName,
            category: type,
            line: -1,
            id: id,
            type: 'PT'
        });
        etsLayer.getSource().addFeature(ptFeature);
        generatedrawdata.push({"name": ptName, "geom": wktPoint, id: id});
        generatedData.ETSdata.push({"name": ptName, "geom": wktPoint, id: id});
        return id;
    },
    removePoint: function (id) {
        geomOp.clearTempGeom();
        referencePoints = commonOps.removeFromArrayByAttr(referencePoints, "id", id);
        generatedData.points = commonOps.removeFromArrayByAttr(generatedData.points, "id", id);
        pointgridData = commonOps.removeFromArrayByAttr(pointgridData, "id", id);
        let features = vectorPoints.getSource().getFeatures();
        for (i = features.length - 1; i >= 0; i--) {
            if (features[i].get("id") === id) {
                vectorPoints.getSource().removeFeature(features[i]);
            }
        }
    },
    removerawPoint: function (id) {
        geomOp.clearTempGeom();
        generatedData.ETSdata = commonOps.removeFromArrayByAttr(generatedData.ETSdata, "id", id);
        generatedrawdata = commonOps.removeFromArrayByAttr(generatedrawdata, "id", id);
        let features = etsLayer.getSource().getFeatures();
        for (i = features.length - 1; i >= 0; i--) {
            if (features[i].get("id") === id) {
                etsLayer.getSource().removeFeature(features[i]);
            }
        }
    },
    createLine: function (wktLine, type, preFilledId) {
        let id = preFilledId;
        if (!id) {
            id = commonOps.createID();
        }
        let bline = _wktFormat.readGeometry(wktLine);
        let lName = "L" + (generatedData.lines.length + 1);
        generatedData.lines.push({id: id, name: lName, geom: wktLine});
        linegridData.push({"id": id, "actions": '<button onclick="someFunction(this)">check</button>', "slno": linegridData.length + 1, "name": lName, "geom": wktLine, "details": category + " - " + pointtype})
        bline.forEachSegment(function (c1, c2) {
            let lns = new ol.geom.LineString([c1, c2]);
            let lnFeature = new ol.Feature({
                geometry: lns,
                name: lName,
                category: type,
                length: "" + lns.getLength().toFixed(2),
                id: id,
                type: 'LN'

            });
            vectorLines.getSource().addFeature(lnFeature);
        });
        return {"name": lName, "id": id};
    },
    removeLine: function (id) {
        geomOp.clearTempGeom();
        generatedData.lines = commonOps.removeFromArrayByAttr(generatedData.lines, "id", id);
        linegridData = commonOps.removeFromArrayByAttr(linegridData, "id", id);
        let features = vectorLines.getSource().getFeatures();
        for (i = features.length - 1; i >= 0; i--) {
            if (features[i].get("id") === id) {
                vectorLines.getSource().removeFeature(features[i]);
            }
        }
    },
    createPolygon: function (wktPoly, preFilledId) {
        let id = preFilledId;
        if (!id) {
            id = commonOps.createID();
        }
        let pName = "P" + (generatedData.polygons.length + 1);
        if (typeof editableKeys !== "undefined" && editableKeys && editableKeys.length > 0) {
            var toPush = {id: id, name: pName, category: POLYGONTYPE.CREATED, geom: wktPoly};
            for (let i = 0; i < editableKeys.length; i++) {
                toPush[editableKeys[i].field] = '';
            }
            generatedData.polygons.push(toPush);
            polygongridData.push({"id": id, "actions": '<button onclick="someFunction(this)">check</button>', "slno": polygongridData.length + 1, "name": pName, "geom": wktPoly, "details": category + " - " + pointtype});
        } else {
            generatedData.polygons.push({id: id, name: pName, category: POLYGONTYPE.CREATED, geom: wktPoly});
            polygongridData.push({"id": id, "actions": '<button onclick="someFunction(this)">check</button>', "slno": polygongridData.length + 1, "name": pName, "geom": wktPoly, "details": category + " - " + pointtype});
        }
        let feature = new ol.Feature({
            geometry: _wktFormat.readGeometry(wktPoly),
            name: pName,
            category: POLYGONTYPE.CREATED,
            id: id,
            type: OPERATION.POLYGON

        });
        vectorPolygon.getSource().addFeature(feature);
        panelOps.commonOps.refreshPolygonsInDataDisplay();
    },
    clearTempGeom: function () {
        tempLayer.getSource().clear();
    }
};
var panelOps = {
    etsPanel: {
        initPanel: function () {
            var width = window.innerWidth;
            var height = window.innerHeight;
            importPanelHeight = height / 2;
            importPanelWidth = width / 3;
            if (importPanelHeight > 550) {
                importPanelHeight = 550;
            } else {
                importPanelHeight = 430;
            }
            if (importPanelWidth > 400) {
                importPanelWidth = 400;
            } else {
                importPanelWidth = 350;
            }
            if (panelPoint !== null) {
                panelPoint.close((id) => {
                    panelPoint = null;
                });
            }
            panelPoint = jsPanel.create({
                iconfont: 'material-icons',
                headerTitle: 'Import Base Points / ETS Points',
                closeOnEscape: true,
                contentFetch: {
                    resource: servicePathPanel + "_point.html",
                    done: function (response, panel) {
                        panel.contentRemove();
                        panel.content.append(jsPanel.strToHtml(response));
                        panelOps.etsPanel.toggleInputFormat();
                        document.getElementById("importsavebtn").addEventListener("click", panelOps.etsPanel.preCreatePoint);
                        document.getElementById("datatypeswitch").addEventListener("change", panelOps.etsPanel.toggleInputFormat);
                        document.getElementById("addRowbtn").addEventListener("change", panelOps.etsPanel.addRow);
                    }
                },
                position: 'center',
                theme: 'dark ',
                contentSize: importPanelWidth + ' ' + importPanelHeight,
                borderRadius: '.5rem',
                headerControls: 'xs', // shorthand
                onclosed: function (panel, closedByUser) {
                    panelPoint = null;
                }
            });
        },
        removeRow: function (getThis) {
            getThis.parentNode.remove();
        },
        addRow: function () {
            $("<tr><td><input type='text' class='form-control fullWidth' placeholder='Name' name='namer1'></td><td><input type='text' class='form-control fullWidth' placeholder='P1' name='p1r1'></td><td><input type='text' class='form-control fullWidth' placeholder='P2' name='p2r1'></td><td onclick='panelOps.etsPanel.removeRow(this)'><span class='material-icons-outlined'>clear</span></td>").insertBefore($("#addrow").parent());
        },
        toggleInputFormat: function (elem) {
            var tabHtml = "<table class='table' id='inppttab'><tr><td ><input value='' type='text' class='form-control fullWidth' name='namer1' placeholder='Name'></td><td ><input value='' type='text' class='form-control fullWidth' name='p1r1' placeholder='P1'>";
            tabHtml += "</td><td><input type='text' class='form-control fullWidth' value='' name='p2r1' placeholder='P2'></td><td onclick='panelOps.etsPanel.removeRow(this)'>Clear</td></tr><tr><td colspan='3'  id='addrow'></td></tr>";
            tabHtml += "</table>";
            console.log('Entered to toggle');
            let inpFormat;
            debugger;
            if (elem === undefined) {
                if (document.getElementById("datatypeswitch")) {
                    inpFormat = document.getElementById("datatypeswitch").checked;
                } else {
                    inpFormat = false;
                }
            } else {
                inpFormat = document.getElementById("datatypeswitch").checked;
            }
            if (document.getElementById('addRowbtn')) {
                if (inpFormat) {
                    document.getElementById('addRowbtn').style.display = "none";
                } else {
                    document.getElementById('addRowbtn').style.display = "inline-block";
                }
            }

//document.getElementById('inppttab').value.length
            if (!inpFormat) {

                isControlInCSV = false;
                if (!(document.getElementById('inppttab'))) {
                    debugger;
                    if (document.getElementById('tab')) {
                        document.getElementById('tab').innerHTML = tabHtml;
                    }
                }
                if (document.getElementById('tab')) {
                    document.getElementById('tab').classList.remove('DN');
                }
                if (document.getElementById('area')) {
                    document.getElementById('area').classList.add('DN');
                }

            } else {
                isControlInCSV = true;
                if (!(document.getElementById('inpptarea'))) {
                    var inpAreaHtml = '<h6>Upload a CSV formatted file or Directly enter the input.</h6><div class="flexDisplay fullWidth"><input type="file" onchange="panelOps.etsPanel.importData()" class="form-control" id="fileUpload" data-browse-on-zone-click="true"/></div><br>';
                    inpAreaHtml += '<div><textarea id="inpptarea" placeholder="name1,pt1,pt2,pt3&#13;&#10;name2,pt1,pt2,pt3"></textarea></div>';
                    document.getElementById('area').innerHTML = inpAreaHtml;
                }
                document.getElementById('area').classList.remove('DN');
                document.getElementById('tab').classList.add('DN');
            }
        },
        importData: function () {
            var fileUpload = document.getElementById("fileUpload");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof (FileReader) !== "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById('inpptarea').value = e.target.result;
                    };
                    reader.readAsText(fileUpload.files[0]);
                } else {
                    alert("This browser does not support HTML5.");
                }
            } else {
                alert("Please upload a valid CSV file.");
            }
        },
        preCreatePoint: function () {
            let undoOp = [];
            let redoOp = [];
            if (isControlInCSV) {
                var csv_val = document.getElementById('inpptarea').value.split("\n");
                for (var i = 0; i < csv_val.length; i++) {
                    let inpData = (csv_val[i].split('   ')[0]).split(",");
                    console.log(inpData);
                    //csv validation
                    let csvDatLen = inpData.length;
                    if (csvDatLen === 1) {
                        continue;//empty line, no issues
                    } else if (csvDatLen <= 2) {
                        alert("Invalid entry present at row number - " + (i + 1));
                    }
                    let pt = new ol.geom.Point([inpData[1] + " " + inpData[2]]);
                    let wktPt = _wktFormat.writeGeometry(pt);
                    let id = geomOp.createRawPoints(inpData[0], wktPt, POINTTYPE.CREATED);
                    undoOp.push(id);
                    redoOp.push({"name": inpData[0], "geom": wktPt, "type": POINTTYPE.CREATED, "id": id});
                    map.getView().fit(etsLayer.getSource().getExtent(), map.getSize());

                }
            } else {
                $("#inppttab").find('tr').each(function (i, el) {
                    let lastRow = $("#inppttab").find('tr').length - 1;//unwanted row call
                    if (i === 0 || i === lastRow) {
                        return;
                    }
                    var $tds = $(this).find('td'),
                            name = $tds.eq(0).find("input[name='namer1']").val(),
                            pt1 = $tds.eq(1).find("input[name='p1r1']").val(),
                            pt2 = $tds.eq(2).find("input[name='p2r1']").val();
                    let pt = new ol.geom.Point([pt1 + " " + pt2]);
                    let wktPt = _wktFormat.writeGeometry(pt);
                    let id = geomOp.createRawPoints(name, wktPt, POINTTYPE.CREATED);
                    undoOp.push(id);
                    redoOp.push({"name": name, "geom": wktPt, "type": POINTTYPE.CREATED, "id": id});
                });
                map.getView().fit(etsLayer.getSource().getExtent(), map.getSize());

            }
            if (generatedDataPanel === null) {
                panelOps.basePointPanel.initPanel();
            }
            geomOp.preCreateRawPoint(false, undoOp, redoOp);
            debugger;
            map.getView().fit(etsLayer.getSource().getExtent(), map.getSize());
        }
    },
    basePointPanel: {
        initPanel: function () {
            let vPh = ((window.innerHeight) - 130);
            generatedDataPanel = jsPanel.create({
                iconfont: 'material-icons',
                headerTitle: 'Imported ETS Points / Base Points',
                contentFetch: {
                    resource: servicePathPanel + '_generateddata.html',
                    done: function (response, panel) {
                        panel.contentRemove();
                        panel.content.append(jsPanel.strToHtml(response));
                        document.getElementById("rawptallchkbox").addEventListener("change", function () {
                            highlightOp.doHighlight(undefined, 'raw');
                        });
                        document.getElementById("rawptDeleteBtn").addEventListener("click", function () {
                            commonOps.bulkDelete('rawpoints');
                        });
                    }
                },
                position: 'right-top -60 50',
                contentSize: '360 ' + vPh,
                borderRadius: '.5rem',
                theme: 'dark',
                headerControls: {
                    minimize: 'remove',
                    maximize: 'remove',
                    close: 'remove'
                }
            });
        },
        refreshetsPoints: function () {
            let points = generatedData.ETSdata;
            if (points) {
                //document.getElementById('rawpointtitle').classList.remove('DN');
                let pointTabHtml = '';
                for (let i = 0; i < points.length; i++) {
                    pointTabHtml += '<tr><td><input visibilityfactor="' + points[i].id + 'chkbox" type="checkbox" name="rawptchkbox" onchange=highlightOp.doHighlight("' + points[i].id + '","raw") id="' + points[i].id + '"></td><td>' + points[i].name + '</td>';
                    pointTabHtml += '<td class="DN">' + points[i].id + '</td>' + '<td class="DN">' + points[i].geom + '</td><td>';
                    pointTabHtml += '<button title="Delete Point" class="buttonclose mdc-icon-button material-icons" onclick=geomOp.preDeleterawPoint("' + points[i].id + '")>clear</button></td>';
                    pointTabHtml += '</tr>';
                }
                document.getElementById('generatedpointstab').innerHTML = pointTabHtml;
            } else {
                document.getElementById('rawpointtitle').classList.add('DN');
            }
        }
    },
    pickPanel: {
        initPanel: function (name, category) {
            if (insertpointPnel !== null) {
                insertpointPnel.close((id) => {
                    insertpointPnel = null;
                });
            }
            try {
                insertlinePanel.close();
                insertlinePanel = null;
            } catch (error) {
                console.log(error);
            }
            insertpointPnel = jsPanel.create({
                closeOnEscape: true,
                iconfont: 'material-icons',
                headerTitle: 'Insert Points',
                contentFetch: {
                    resource: servicePathPanel + "_insertpointUI.html",
                    done: function (response, panel) {
                        panel.contentRemove();
                        panel.content.append(jsPanel.strToHtml(response));
                        pickFlag = false;
                        panelOps.pickPanel.loadPanelContents();
                        document.getElementById('pointpickerbtn').addEventListener('click', panelOps.commonOps.chooseDatafrommap);
                        document.getElementById('pickpanelcancel').addEventListener('click', panelOps.pickPanel.closePanel);
                        document.getElementById('pickpanelok').addEventListener('click', panelOps.commonOps.createDatafromBase);
                        vectorLineLayer.getSource().clear();
                    }
                },
                position: 'left-bottom 5 -50',
                theme: 'dark ',
                borderRadius: '.5rem',
                contentSize: '360 250',
                headerControls: 'xs', // shorthand
                onclosed: function (panel, closedByUser) {
                    insertpointPnel = null;
                    pickFlag = false;
                    vectorLineLayer.getSource().clear();
                }
            });
        },
        loadPanelContents: function () {
            document.getElementById('insertpointcategory').innerHTML = "Insert   &nbsp&nbsp&nbsp&nbsp" + category;
            document.getElementById('insertpointtype').innerHTML = "Type:  &nbsp&nbsp&nbsp" + pointtype;
            pickFlag = true;
            linestr = "LINESTRING(";
            polystr = "POLYGON((";
            flagFirstline = true;
            previousline = null;
            //    vectorLineLayer.getSource().clear();
            vectorLineLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({color: '#00FF00', weight: 4}),
                    stroke: new ol.style.Stroke({color: '#00FF00', width: 2})
                })
            });
            map.addLayer(vectorLineLayer);
            panelOps.commonOps.chooseDatafrommap();
        },
        closePanel: function () {
            if (insertpointPnel !== null) {
                insertpointPnel.close();
                insertpointPnel = null;
            }
            pickFlag = false;
            vectorLineLayer.getSource().clear();
            previousline = null;
        }
    },
    commonOps: {
        createDatafromBase: function () {
            if (category === "point") {
                let undoOp = [];
                let redoOp = [];
                let isImportCSV = false;
                if ($("#csvgsidataarea").length === 0) {
                    alert('There is nothing to add... :(');
                    isImportCSV = false;
                } else {
                    isImportCSV = true;
                }
                if (isImportCSV) {
                    var csv_val = ($("#csvgsidataarea").val()).split("\n");
                    for (var i = 0; i < csv_val.length; i++) {
                        let inpData = (csv_val[i].split('	')[0]).split(",");
                        console.log(inpData);
                        //csv validation
                        let csvDatLen = inpData.length;
                        if (csvDatLen === 1) {
                            continue;//empty line, no issues
                        } else if (csvDatLen <= 2) {
                            alert("Invalid entry present at row number - " + (i + 1));
                        }
                        let pt = new ol.geom.Point([inpData[1] + " " + inpData[2]]);
                        let wktPt = _wktFormat.writeGeometry(pt);
                        let id = geomOp.createPoint(inpData[0], wktPt, POINTTYPE.CREATED);
                        undoOp.push(id);
                        redoOp.push({"name": inpData[0], "geom": wktPt, "type": POINTTYPE.CREATED, "id": id});
                    }
                }
                geomOp.preCreatePoint(false, undoOp, redoOp);
                debugger;
            } else if (category === "line") {
                linestr = linestr + ")";
                let lineData = {"geom": linestr, "type": LINETYPE.CREATED};
                geomOp.preCreateLine(lineData);
                vectorLineLayer.getSource().clear();
                previousline = null;
                commonOps.interactions.clearInteractions();
            } else if (category === "polygon") {
                polystr = polystr + "))";
                geomOp.createPolygon(polystr);
            }
            panelOps.pickPanel.closePanel();
            $("#generatedpointstab").find("input[name='rawptchkbox']").each(function (i, data) {
                $(data).prop("checked", false);
            });
        },
        pointPickFromMap: function () {
            commonOps.interactions.clearInteractions();
            pointerMoveSelectEvent = map.on('pointermove', function (e) {

                if (pickFlag) {
                    geomOp.clearTempGeom();
                }
                map.forEachFeatureAtPixel(e.pixel, function (feature) {

                    if (feature && pickFlag) {

                        var ty = feature.get("type");
                        if (ty === 'PT') {
                            if (feature.get("category") === POINTTYPE.CREATED) {
                                if (tempLayer.getSource().getFeatures().length === 0) {
                                    let f1 = feature.clone();
                                    // f1.unset('type', true);
                                    tempLayer.getSource().addFeature(f1);
                                }
                            }
                        }
                    }
                },
                        {
                            layerFilter: function (layer) {
                                return (layer.get('name') === 'etsLayer');
                            }
                        }
                );
            });

            pointerClickSelectEvent = map.on('singleclick', function (e) {
                map.forEachFeatureAtPixel(e.pixel, function (feature) {
                    if (feature && pickFlag) {
//                console.log(feature.get("id") + " - " + feature.get("name") + " - " + feature.get("type"));
                        var ty = feature.get("type");
                        if (ty === 'PT') {
                            if (feature.get("category") === POINTTYPE.CREATED) {
                                commonOps.unbindPointerEvents();
                                let choosedpointname = feature.get("name");
                                let choosedpointID = feature.get("id");
                                let choosedpointFlatcoordinates = feature.get("geometry").flatCoordinates[0] + "," + feature.get("geometry").flatCoordinates[1];
                                let pointstring = choosedpointname + "," + choosedpointFlatcoordinates;
                                $("#csvgsidataarea").append(pointstring);
                                $("#csvgsidataarea").append("\n");
                                if (category === "line") {

                                    if (previousline !== null) {
                                        geomOp.createTempLine(previousline, [feature.get("geometry").flatCoordinates[0], feature.get("geometry").flatCoordinates[1]]);
                                    }
                                    previousline = [feature.get("geometry").flatCoordinates[0], feature.get("geometry").flatCoordinates[1]];

                                    if (flagFirstline) {
                                        linestr = linestr + feature.get("geometry").flatCoordinates[0] + " " + feature.get("geometry").flatCoordinates[1];
                                        flagFirstline = false;
                                    } else {
                                        linestr = linestr + "," + feature.get("geometry").flatCoordinates[0] + " " + feature.get("geometry").flatCoordinates[1];
                                    }
                                } else if (category === "polygon") {
                                    if (previousline !== null) {
                                        geomOp.createTempLine(previousline, [feature.get("geometry").flatCoordinates[0], feature.get("geometry").flatCoordinates[1]]);
                                    }
                                    previousline = [feature.get("geometry").flatCoordinates[0], feature.get("geometry").flatCoordinates[1]];

                                    if (flagFirstline) {
                                        polystr = polystr + feature.get("geometry").flatCoordinates[0] + " " + feature.get("geometry").flatCoordinates[1];
                                        flagFirstline = false;
                                    } else {
                                        polystr = polystr + "," + feature.get("geometry").flatCoordinates[0] + " " + feature.get("geometry").flatCoordinates[1];
                                    }
                                }
                                document.getElementById(choosedpointID).checked = true;
                                panelOps.commonOps.pointPickFromMap();

                            }
                        }
                    }
                },
                        {
                            layerFilter: function (layer) {
                                return (layer.get('name') === 'etsLayer');
                            }
                        }
                );
            });
        },
        refreshPointsInDataDisplay: function () {
            grid.resetData(pointgridData);
        },
        refreshPolygonsInDataDisplay: function () {
            polygrid.resetData(polygongridData);
        },
        refreshLinesInDataDisplay: function () {
            linegrid.resetData(linegridData);
        },
        chooseDatafrommap: function () {
            if (pickFlag) {
                $("#pointpickerbtn").html("|>");
                if (generatedrawdata.length === 0) {
                    alert('There is no ETS Points Loaded... PLease import ETSPoints first');
                } else {
                    if (category === "point" || category === "line" || category === "polygon") {
                        panelOps.commonOps.pointPickFromMap();
                    }
                    pickFlag = false;
                }
            } else {
                $("#pointpickerbtn").html("|<");
                pickFlag = true;
            }
        }
    }
};


var commonOps = {
    initJSON: function (jsonfile) { },
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
            geomOp.clearTempGeom();
            map.removeInteraction(drawInteraction);
            map.removeInteraction(snapInteraction);
            drawInteraction = null;
            snapInteraction = null;
            document.removeEventListener('keydown', commonOps.escapeDown);
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
                geomOp.removeLine(id);
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
                geomOp.removePoint(id);
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
                geomOp.removerawPoint(id);
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
                geomOp.removePoint(id);
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
                            geomOp.removePoint(undoOpDetailsData[i]);
                        }
                    } else {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            geomOp.createPoint(undoOpDetailsData[i].name, undoOpDetailsData[i].geom, POINTTYPE.CREATED, undoOpDetailsData[i].id);
                        }
                    }
                    panelOps.commonOps.refreshPointsInDataDisplay();
                    break;
                case "line":
                    var undoOpDetailsData = undoOpDetails.data;
                    if (undoOpDetails.action === "create") {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            geomOp.removeLine(undoOpDetailsData[i]);
                        }
                    } else {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            geomOp.createLine(undoOpDetailsData[i].geom, LINETYPE.CREATED, undoOpDetailsData[i].id);
                        }
                    }
//                    split();
                    panelOps.commonOps.refreshLinesInDataDisplay();
                    break;
                case "etspoint":
                    var undoOpDetailsData = undoOpDetails.data;
                    if (undoOpDetails.action === "create") {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            geomOp.removerawPoint(undoOpDetailsData[i]);
                        }
                    } else {
                        for (let i = 0; i < undoOpDetailsData.length; i++) {
                            geomOp.createRawPoints(undoOpDetailsData[i].name, undoOpDetailsData[i].geom, POINTTYPE.CREATED, undoOpDetailsData[i].id);
                        }
                    }
                    panelOps.basePointPanel.refreshetsPoints();
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
                            geomOp.createPoint(redoOpDetailsData[i].name, redoOpDetailsData[i].geom, POINTTYPE.CREATED, redoOpDetailsData[i].id);
                        }
                    } else {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            geomOp.removePoint(redoOpDetailsData[i]);
                        }
                    }
                    panelOps.commonOps.refreshPointsInDataDisplay();
                    break;
                case "line":
                    var redoOpDetailsData = redoOpDetails.data;
                    if (redoOpDetails.action === "create") {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            geomOp.createLine(redoOpDetailsData[i].geom, LINETYPE.CREATED, redoOpDetailsData[i].id);
                        }
                    } else {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            geomOp.removeLine(redoOpDetailsData[i]);
                        }
                    }
//                    split();
                    panelOps.commonOps.refreshLinesInDataDisplay();
                    break;
                case "etspoint":
                    var redoOpDetailsData = redoOpDetails.data;
                    if (redoOpDetails.action === "create") {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            geomOp.createRawPoints(redoOpDetailsData[i].name, redoOpDetailsData[i].geom, POINTTYPE.CREATED, redoOpDetailsData[i].id);
                        }
                    } else {
                        for (let i = 0; i < redoOpDetailsData.length; i++) {
                            geomOp.removerawPoint(redoOpDetailsData[i]);
                        }
                    }
                    panelOps.basePointPanel.refreshetsPoints();
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
                        let ft = commonOps.GetFeature(LAYERTYPE.LINES, LAYERGETTYPE.NAME, name);
                        for (let i = 0; i < ft.length; i++) {
                            tempLayer.getSource().addFeature(ft[i]);
                        }
                    });
                } else {
//                    $("#linestab").find("input[name='lnchkbox']").prop("checked", false);
                    $("#linestab").find("input[name='lnchkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let name = $(data).attr("custname");
                        let ft = commonOps.GetFeature(LAYERTYPE.LINES, LAYERGETTYPE.NAME, name);
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
                    let ft = commonOps.GetFeature(LAYERTYPE.LINES, LAYERGETTYPE.NAME, name);
                    for (let i = 0; i < ft.length; i++) {
                        tempLayer.getSource().addFeature(ft[i]);
                    }
                } else {
                    let ft = commonOps.GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.NAME, name);
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
                        let ft = commonOps.GetFeature(LAYERTYPE.POLYGON, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().addFeature(ft[0]);
                    });
                } else {
                    $("#polygonstab").find("input[name='polychkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let id = $(data).attr("id");
                        let ft = commonOps.GetFeature(LAYERTYPE.POLYGON, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().removeFeature(ft[0]);
                    });
                }
            } else {
                if (flag) {
                    let ft = commonOps.GetFeature(LAYERTYPE.POLYGON, LAYERGETTYPE.ID, id);
                    let f1 = ft[0].clone();
                    tempLayer.getSource().addFeature(f1);
                } else {
                    let ft = commonOps.GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.ID, id);
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
                        let ft = commonOps.GetFeature("etsLayer", LAYERGETTYPE.ID, id);
                        tempLayer.getSource().addFeature(ft[0]);
                    });
                } else {
                    $("#generatedpointstab").find("input[name='rawptchkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let id = $(data).attr("id");
                        let ft = commonOps.GetFeature("etsLayer", LAYERGETTYPE.ID, id);
                        tempLayer.getSource().removeFeature(ft[0]);
                    });
                }
            } else {
                if ($("#" + id).is(":checked")) {
                    let ft = commonOps.GetFeature("etsLayer", LAYERGETTYPE.ID, id);
                    let f1 = ft[0].clone();
                    tempLayer.getSource().addFeature(f1);
                } else {
                    let ft = commonOps.GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.ID, id);
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
                        let ft = commonOps.GetFeature(LAYERTYPE.POINTS, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().addFeature(ft[0]);
                    });
                } else {
                    $("#pointstab").find("input[name='ptchkbox']").each(function (i, data) {
                        $(data).prop("checked", false);
                        let id = $(data).attr("id");
                        let ft = commonOps.GetFeature(LAYERTYPE.POINTS, LAYERGETTYPE.ID, id);
                        tempLayer.getSource().removeFeature(ft[0]);
                    });
                }
            } else {
                if (flag) {
                    let ft = commonOps.GetFeature(LAYERTYPE.POINTS, LAYERGETTYPE.ID, id);
                    let f1 = ft[0].clone();
                    tempLayer.getSource().addFeature(f1);
                } else {
                    let ft = commonOps.GetFeature(LAYERTYPE.TEMP, LAYERGETTYPE.ID, id);
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

var tools = {
    initTools: function () {
        document.getElementById("attributeHamberger").addEventListener("click", tools.uiOps.attributeDataShow);
        document.getElementById("tayertypes").addEventListener("click", tools.uiOps.generatedDataShow);
        document.getElementById("createfromlist").addEventListener("click", tools.uiOps.generatefromData);
        document.getElementById("iconcloseleftbar").addEventListener("click", tools.uiOps.attributeDataShow);
        document.getElementById("pointdatabutton").addEventListener("click", tools.uiOps.openLayerpanel);
        document.getElementById("linedatabutton").addEventListener("click", tools.uiOps.openLayerpanel);
        document.getElementById("polygondatabutton").addEventListener("click", tools.uiOps.openLayerpanel);
        document.getElementById("onscreenGenerateddatabtn").addEventListener("click", tools.uiOps.generatedDataShow);
        document.getElementById("closeongenerateddata").addEventListener("click", tools.uiOps.generatedDataShow);
        document.getElementById("clearinteractionbtn").addEventListener("click", commonOps.interactions.clearInteractions);
        document.getElementById("importETSdatabtn").addEventListener("click", panelOps.etsPanel.initPanel);
        document.getElementById("highligtingBtn").addEventListener("click", geomOp.highlightFeature);
        document.getElementById("showgridbtn").addEventListener("click", commonOps.addGraticule);
        document.getElementById("hidegridbtn").addEventListener("click", commonOps.removeGraticule);
        document.getElementById("navbarSwitcher").addEventListener("click", tools.uiOps.togglemenuBar);
        document.getElementById("bulkcleardata").addEventListener("click", tools.uiOps.clearSelectedMenu);

        let uniqueNames = [];
        let samplearray = [];
        for (var x = 0; x < listdata.length; x++) {
            uniqueNames.push(listdata[x].layer_type);
        }
        xarray = [...new Set(uniqueNames)];
        let i = 0;
        lineTabHtml = '<select name="sample" id="dropdownListType" onchange="" class="d-inline-block selection addDataFromETSpoints marginleft-16">';

        for (i = 0; i < xarray.length; i++) {
            lineTabHtml += '<optgroup label="' + xarray[i] + '">';
            for (var xc = 0; xc < listdata.length; xc++) {
                if (xarray[i] === listdata[xc].layer_type && !(samplearray.includes(listdata[xc].layer_name))) {
                    lineTabHtml += '<option name="' + xarray[i] + '" value=' + listdata[xc].layer_name + '>' + listdata[xc].layer_name + '</option>';
                    samplearray.push(listdata[xc].layer_name);
                }
            }
            lineTabHtml += '</optgroup>';
        }
        lineTabHtml += '</select>';
        var customdiv = document.createElement('span');
        customdiv.innerHTML = lineTabHtml;
        document.getElementById('datalistdropdown').append(customdiv);
        let selectData = initialData.attributes;
        let contentDiv = document.getElementById('locationinfodistrictClass');
        let blockdiv = document.getElementById('locationinfoblockClass');
        for (let i = 0; i < selectData.length; i++) {
            if (selectData[i].visible && selectData[i].text) {
                var temdiv = document.createElement('div');
                temdiv.className = 'locationDetailscard';
                var childdiv1 = document.createElement('div');
                childdiv1.className = 'h6 small clr-hdg';
                childdiv1.innerHTML = selectData[i].label;

                var childdiv2 = document.createElement('div');
                childdiv2.className = 'h6 ';
                childdiv2.innerHTML = selectData[i].value;

                temdiv.appendChild(childdiv1);
                temdiv.appendChild(childdiv2);

                contentDiv.appendChild(temdiv);
            }
        }
        for (let i = 0; i < selectData.length; i++) {
            if (selectData[i].visible && !(selectData[i].text)) {
                var temdiv = document.createElement('div');
                temdiv.className = 'blockinfoCard';
                var childdiv1 = document.createElement('div');
                childdiv1.className = 'h6 small text-white';
                childdiv1.innerHTML = selectData[i].label;

                var childdiv2 = document.createElement('div');
                childdiv2.className = 'h6 logoText text-white';
                childdiv2.innerHTML = selectData[i].value;

                temdiv.appendChild(childdiv1);
                temdiv.appendChild(childdiv2);

                blockdiv.appendChild(temdiv);
            }
        }
        geomOp.initGrids();
    },
    windowResize: function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        if (width < 0) {
            document.getElementById('hambergerMenu').style.display = "inline-block";
            document.getElementById('controltoolbars').style.display = "none";
            document.getElementById('responsiveContent').style.display = "block";
        } else {
            document.getElementById('responsiveContent').style.display = "none";
            document.getElementById('hambergerMenu').style.display = "none";
            document.getElementById('controltoolbars').style.display = "inline-block";
        }
        importPanelHeight = height / 2;
        importPanelWidth = width / 3;
        if (importPanelHeight > 550) {
            importPanelHeight = 550;
        } else {
            importPanelHeight = 430;
        }
        if (importPanelWidth > 400) {
            importPanelWidth = 400;
        } else {
            importPanelWidth = 350;
        }
    },
    toggleclass: function (elmt, clss) {
        var ele = document.getElementById(elmt);
        var templist = ele.className;
        var classArr = templist.split(/\s+/);
        var eleflag = classArr.includes(clss);
        if (eleflag) {
            ele.classList.remove(clss);
        } else {
            ele.classList.add(clss);
        }
    },
    uiOps: {
        attributeDataShow: function () {
            tools.toggleclass('slide-in-data', 'show');
        },
        generatedDataShow: function () {
            tools.toggleclass('slide-in-dataRight', 'show');
        },
        togglemenuBar: function () {
            tools.toggleclass('menubarPane', 'dotoggle');
            tools.toggleclass('attributeHamberger', 'content-to-bottom');
            tools.toggleclass('tayertypes', 'content-to-bottom');
        },
        openLayerpanel: function (evt) {
            var cityName = '';
            var getID = evt.currentTarget.id;
            if (getID === 'pointdatabutton') {
                location.href = '#grid';
                loadedData = "points";
            } else if (getID === 'linedatabutton') {
                location.href = '#linesData';
                loadedData = "lines";
            } else {
                location.href = '#PolygonData';
                loadedData = "polygons";
            }
            var i, tabcontent, tablinks;
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            evt.currentTarget.className += " active";
        },
        generatefromData: function () {
            var index = document.getElementById("dropdownListType").selectedIndex;
            var selectBox = document.getElementById('dropdownListType');
            var selectedIndex = selectBox.options[index].value;
            var selectedIndexName = selectBox.options[index].getAttribute('name');
            if (selectedIndexName === 'point') {
                panelOps.pickPanel.initPanel(selectedIndex, selectedIndexName);
            } else if (selectedIndexName === 'line') {
                panelOps.pickPanel.initPanel(selectedIndex, selectedIndexName);
//            insertlinepanelUI(selectedIndex, selectedIndexName);
//            drawLine();
            } else if (selectedIndexName === 'polygon') {
                panelOps.pickPanel.initPanel(selectedIndex, selectedIndexName);
            } else {
                alert('Caught an error or mismatch type');
            }
            pointtype = selectedIndex;
            category = selectedIndexName;
        },
        clearSelectedMenu: function () {
            grid.resetData(pointgridData);
            linegrid.resetData(linegridData);
            polygrid.resetData(polygongridData);
            commonOps.interactions.clearInteractions();
        }
    }
};
(function () {
    fetch('sample-data.json', {
        method: 'GET', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        }, //body: JSON.stringify(data),
    })
            .then(response => response.json())
            .then(data => {
                if (typeof initialDataFromService === 'undefined') {
                    initialData = data;
                } else {
                    initialData = JSON.parse(initialDataFromService);
                }
                listdata = initialData.layer_master;
                Maps.MapOps.initMaps();
                tools.initTools();
            })
            .catch((error) => {
                console.log(error);
            });
})();