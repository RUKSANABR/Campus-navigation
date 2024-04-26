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

const LAYERTYPE = { LINES: "vectorLines", POINTS: "vectorPoints", TEMP: "tempLayer", POLYGON: "vectorPolygon" };
const LAYERGETTYPE = { ID: "id", NAME: "name" };
let initialData = null;
let listdata = null;
var xarray = [];
let map = null;
let loadedData = "points";
let vectorLineLayer = null;
let vectorPolygon = null;
let vectorPoints = null;
let vectorLines = null;
let _geotagLayer = null;
//let vectorLineSegmants = null;
//pickFlag act as a flag for picking the point from the ets data
let linestr = "LINESTRING(";
let polystr = "POLYGON((";
//let createdLines = [];
let previousline = null;
let generatedData = { points: [], lines: [], polygons: [], ETSdata: [] };
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
let generatedDataPanel = null;
let pointerMoveSelectEvent = null;
let pointerClickSelectEvent = null;
const OPERATION = { POINT: "P", LINE: "L" };
const ACTION = { CREATE: "create", DELETE: "delete" };
var grid = null;
var linegrid = null;
var polygrid = null;
var pointgridData = [];
var linegridData = [];
var polygongridData = [];
var _isPanned = false;

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
                                fill: new ol.style.Fill({ color: 'rgba(0, 0, 200, 0.2)' }),
                                stroke: new ol.style.Stroke({ color: 'blue', width: 5 }),
                            }),
                            text: new ol.style.Text({
                                textAlign: 'center',
                                textBaseline: 'bottom',
                                text: feature.get('name'),
                                fill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
                                stroke: new ol.style.Stroke({ color: 'rgba(0, 0, 0, 0.7)', width: 1 }),
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
                                width: 5,
                                color: [45, 32, 208, 0.8], //237, 212, 0, 0.8
                            }),
                            text: new ol.style.Text({
                                placement: 'line',
                                textBaseline: 'bottom',
                                text: feature.get('name'),
                                fill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
                            })
                        });
                    }
                });
            }

            const iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [10, 20],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    src: "/static/lib/icons/pin-icon.svg",
                }),
            });

            if (_geotagLayer === null) {
                _geotagLayer = new ol.layer.Vector({
                    name: "TagLocation",
                    source: new ol.source.Vector({
                        features: features
                    }),
                    style: iconStyle
                });
            }

            const orangePointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({ color: 'rgba(255, 165, 0, 0.5)' }), 
                    stroke: new ol.style.Stroke({ color: 'orange', width: 2 }), 
                }),
            });

            // Create an extra layer for orange points
            const orangePointsLayer = new ol.layer.Vector({
                name: "orangePoints",
                source: new ol.source.Vector({
                    features: []
                }),
                style: orangePointStyle
            });


            const raster = new ol.layer.Tile({
                source: new ol.source.OSM(),
            });
            const mousePositionControl = new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.createStringXY(4),
                projection: 'EPSG:4326',//'EPSG:900914',
                // comment the following two lines to have the mouse position
                // be placed within the map.
                className: 'custom-mouse-position',
                // target: document.getElementById('mouse-position'),
            });
            const view = new ol.View({
                center: [0, 0],
                zoom: 2,
            })
            if (map === null) {//initalizing the map
                map = new ol.Map({
                    controls: ol.control.defaults().extend([mousePositionControl]),
                    layers: [raster, vectorLines, vectorPoints, _geotagLayer,orangePointsLayer],
                    target: 'map',
                    view: view,
                    projection: 'EPSG:3857'
                });
            }
            map.getView().on('change:center', function (evt) {
                //layerFeatures is a reference of a ol.layer.Vector
                console.log('Event Triggered')
                _isPanned = true;
            });
        },

        initPoints: function (coordinate) {// corordinate should be an array with latitude and longitudein its 0th and 1st index.[]
            let id = commonOps.createID()
            var ptFeature = new ol.Feature({
                geometry : new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
                id : id,
                name : "Point( " +coordinate+" )"
                }
            );
            vectorPoints.getSource().addFeatures([
                ptFeature
            ]);
            map.getView().fit(vectorPoints.getSource().getExtent(), {
                size: map.getSize(),
                maxZoom: 20
            });
            return {
                id: id,
                geometry: coordinate,
                name: 'Point',
                type: OPERATION.POINT
            };

        },
        initLine: function (coordinateArray) {
            let id = commonOps.createID();
            var wktLine = commonOps.arrayToWktLineString(coordinateArray)
            let bline = _wktFormat.readGeometry(wktLine);
            console.log(bline)
            // let lnFeature = new ol.Feature(new ol.geom.LineString(coordinateArray));
            let lnFeature = new ol.Feature({
                geometry: bline,
                id: id,
                type: OPERATION.LINE,
                name:'Line'+id
            });
            lnFeature.id = id;
            lnFeature.name = "Line" + id;
            vectorLines.getSource().addFeatures([
                lnFeature
            ]);
            map.getView().fit(vectorLines.getSource().getExtent(), {
                size: map.getSize(),
                maxZoom: 16
            });
            return {
                id: id,
                geometry: wktLine,
                name: 'Line',
                type: OPERATION.LINE
            };
        },

        initGeotag: function () {//used for accessing the current location
            navigator.geolocation.watchPosition(
                function (pos) {
                    position = pos
                    const coords = [pos.coords.longitude, pos.coords.latitude];
                    const accuracy = ol.geom.Polygon.circular(coords, pos.coords.accuracy);
                    _geotagLayer.getSource().clear(true);
                    _geotagLayer.getSource().addFeatures([
                        new ol.Feature(
                            accuracy.transform('EPSG:3857', map.getView().getProjection())
                        ),
                        new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(coords))),
                    ]);
                    if (!_isPanned) {
                        map.getView().fit(_geotagLayer.getSource().getExtent(), {
                            size: map.getSize(),
                            maxZoom: 20
                        });
                    }

                },
                function (error) {
                    alert(`ERROR: ${error.message}`);
                },
                {
                    enableHighAccuracy: true,
                }
            );

        }


    }
};

const commonOps = {
    createID: function () {
        return Array(16)
            .fill(0)
            .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
            .join('') +
            Date.now().toString(24);
    },
    arrayToWktLineString: function (coords) {
        if (coords.length < 2) {
            alert("At least two coordinates are required to create a LineString");
        } else {
            var coordinates =[]
            for (let i =0; i < coords.length;i++){
                coordinates.push(ol.proj.fromLonLat(coords[i]))//ol.proj.fromLonLat(coords[i])
            }
            let wkt = "LINESTRING (";
            for (let i = 0; i < coordinates.length; i++) {
                wkt += coordinates[i][0] + " " + coordinates[i][1];
                if (i < coordinates.length - 1) {
                    wkt += ", ";
                }
            }
            wkt += ")";
            return wkt;
        }

    }
};

