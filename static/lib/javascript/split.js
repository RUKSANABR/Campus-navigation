/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const servicePathPanel = "lib/jspanel/components/";


const servicePath = "";
const _wktFormat = new ol.format.WKT();
const _jstsReader = new jsts.io.WKTReader();
const createID = () => {
    return Array(16)
            .fill(0)
            .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
            .join('') +
            Date.now().toString(24);
};
const escapeDown = function (e) {
    if (e.which == 27 && drawInteraction != null) {
        drawInteraction.removeLastPoint();
    }
};
const mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:900914',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
});
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
window.onresize = windowReszefunction;
var pointgridData = [];
var linegridData = [];
var polygongridData = [];
(function () {
    fetch('sample-data.json', {
        method: 'POST', // or 'PUT'
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
                initializeMap();
                initFunction();
            })
            .catch((error) => {
                console.log(error);
            });
})();

//mapops.js init fn
function initFunction() {
    document.getElementById("hambergerMenubtn").addEventListener("click", showHamberger);
    document.getElementById("attributeHamberger").addEventListener("click", attributeDataShow);
    document.getElementById("tayertypes").addEventListener("click", generatedDataShow);
    document.getElementById("createfromlist").addEventListener("click", generatefromData);
    document.getElementById("iconcloseleftbar").addEventListener("click", attributeDataShow);
    document.getElementById("pointdatabutton").addEventListener("click", openLayerpanel);
    document.getElementById("linedatabutton").addEventListener("click", openLayerpanel);
    document.getElementById("polygondatabutton").addEventListener("click", openLayerpanel);
    document.getElementById("onscreenGenerateddatabtn").addEventListener("click", generatedDataShow);
    document.getElementById("closeongenerateddata").addEventListener("click", generatedDataShow);
    document.getElementById("attributeresponsivebtn").addEventListener("click", attributeDataShow);
    document.getElementById("clearinteractionbtn").addEventListener("click", clearInteractions);
    document.getElementById("importETSdatabtn").addEventListener("click", importETSData);
    document.getElementById("highligtingBtn").addEventListener("click", deleteFeature);
    document.getElementById("showgridbtn").addEventListener("click", addGraticule);
    document.getElementById("hidegridbtn").addEventListener("click", removeGraticlue);
    document.getElementById("navbarSwitcher").addEventListener("click", togglemenuBar);
    document.getElementById("bulkcleardata").addEventListener("click", clearSelectedMenu);



    windowReszefunction();
    initializelistontoolbar();
    initializeContents();
    tuiGridData();
    tuiGridlineData();
    tuiGridPolygonData();


}

//mapops.js deprecated
function clearSelectedMenu() {
    grid.resetData(pointgridData);
    linegrid.resetData(linegridData);
    polygrid.resetData(polygongridData);
    clearInteractions();
}

//tools.js Tools.Layers.Create
function generatefromData() {
    var index = document.getElementById("dropdownListType").selectedIndex;
    var selectBox = document.getElementById('dropdownListType');
    var selectedIndex = selectBox.options[index].value;
    var selectedIndexName = selectBox.options[index].getAttribute('name');
    if (selectedIndexName === 'point') {
        insertPointpanelUI(selectedIndex, selectedIndexName);
    } else if (selectedIndexName === 'line') {
        insertPointpanelUI(selectedIndex, selectedIndexName);
//            insertlinepanelUI(selectedIndex, selectedIndexName);
//            drawLine();
    } else if (selectedIndexName === 'polygon') {
        insertPointpanelUI(selectedIndex, selectedIndexName);
    } else {
        alert('Caught an error or mismatch type');
    }
    pointtype = selectedIndex;
    category = selectedIndexName;
}

//deprecated
function showHamberger() {
    toggleclass('slide-in', 'show');
}

//tool.js UiOps.General.fn
function attributeDataShow() {
    toggleclass('slide-in-data', 'show');
}

//tool.js UiOps.General.fn
function generatedDataShow() {
    toggleclass('slide-in-dataRight', 'show');
}

//common.js Oper.toggle.fn
function toggleclass(elmt, clss) {
    var ele = document.getElementById(elmt);
    var templist = ele.className;
    var classArr = templist.split(/\s+/);
    var eleflag = classArr.includes(clss);
    if (eleflag) {
        ele.classList.remove(clss);
    } else {
        ele.classList.add(clss);
    }
}

//deprecated
function windowReszefunction() {
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
}
//mapops Layers.switch.fn
function openLayerpanel(evt) {
    var cityName = '';
    var getID = evt.currentTarget.id;
    if (getID === 'pointdatabutton') {
        location.href = '#grid';
//        document.getElementById('grid').classList.remove('DN');
//        document.getElementById('linesData').classList.add('DN');
//        document.getElementById('PolygonData').classList.add('DN');
        loadedData = "points";
    } else if (getID === 'linedatabutton') {
        location.href = '#linesData';
//        document.getElementById('grid').classList.add('DN');
//        document.getElementById('linesData').classList.remove('DN');
//        document.getElementById('PolygonData').classList.add('DN');
        loadedData = "lines";
    } else {
        location.href = '#PolygonData';
//        document.getElementById('grid').classList.add('DN');
//        document.getElementById('linesData').classList.add('DN');
//        document.getElementById('PolygonData').classList.remove('DN');
        loadedData = "polygons";
    }
    var i, tabcontent, tablinks;
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    evt.currentTarget.className += " active";
}

//maops.js GeomOps.Ets.fn
function importETSData() {
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
                toggleInputFormat();
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
}

//tool.js UiOps.fn
function togglemenuBar() {
    toggleclass('menubarPane', 'dotoggle');
    toggleclass('attributeHamberger', 'content-to-bottom');
    toggleclass('tayertypes', 'content-to-bottom');

}

//common.js Toast.fn
function createToastalert(title, message, type) {

    let toast = {
        title: title,
        message: message,
        timeout: 5000
    };
    Toast.create(toast);
}



//mapops.js initfn
function tuiGridData() {
    debugger;
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
}
function tuiGridlineData() {
    debugger;
    var griddiv = document.getElementById('linesData');
    griddiv.innerHTML = "";
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
}
function tuiGridPolygonData() {
    debugger;
    var griddiv = document.getElementById('PolygonData');
    griddiv.innerHTML = "";
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
}


//mapops.js PanelOps:Ets:
var isControlInCSV = false;

function removeRow(getThis) {
    getThis.parentNode.remove();
}
function addRow() {
    $("<tr><td><input type='text' class='form-control fullWidth' placeholder='Name' name='namer1'></td><td><input type='text' class='form-control fullWidth' placeholder='P1' name='p1r1'></td><td><input type='text' class='form-control fullWidth' placeholder='P2' name='p2r1'></td><td onclick='removeRow(this)'><span class='material-icons-outlined'>clear</span></td>").insertBefore($("#addrow").parent());
}

function toggleInputFormat(elem) {
    var tabHtml = "<table class='table' id='inppttab'><tr><td ><input value='' type='text' class='form-control fullWidth' name='namer1' placeholder='Name'></td><td ><input value='' type='text' class='form-control fullWidth' name='p1r1' placeholder='P1'>";
    tabHtml += "</td><td><input type='text' class='form-control fullWidth' value='' name='p2r1' placeholder='P2'></td><td onclick='removeRow(this)'>Clear</td></tr><tr><td colspan='3'  id='addrow'></td></tr>";
    tabHtml += "</table>";
    console.log('Entered to toggle');
    let inpFormat;
    debugger;
    if (elem === undefined) {
        inpFormat = false;
    } else {
        inpFormat = elem.checked;
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
            var inpAreaHtml = '<h6>Upload a CSV formatted file or Directly enter the input.</h6><div class="flexDisplay fullWidth"><input type="file" onchange="Upload()" class="form-control" id="fileUpload" data-browse-on-zone-click="true"/></div><br>';
            inpAreaHtml += '<div><textarea id="inpptarea" placeholder="name1,pt1,pt2,pt3&#13;&#10;name2,pt1,pt2,pt3"></textarea></div>';
            document.getElementById('area').innerHTML = inpAreaHtml;
        }
        document.getElementById('area').classList.remove('DN');
        document.getElementById('tab').classList.add('DN');
    }
}

//mapops.js PanelOps:Ets:importPoints
function preCreatePoint() {
    debugger;
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
            let id = createRawPoints(inpData[0], wktPt, POINTTYPE.CREATED);
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
            let id = createRawPoints(name, wktPt, POINTTYPE.CREATED);
            undoOp.push(id);
            redoOp.push({"name": name, "geom": wktPt, "type": POINTTYPE.CREATED, "id": id});
        });
        map.getView().fit(etsLayer.getSource().getExtent(), map.getSize());

    }
    geomOp.preCreateRawPoint(false, undoOp, redoOp);
    debugger;
    map.getView().fit(etsLayer.getSource().getExtent(), map.getSize());
}
function Upload() {
    debugger;
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
}
//mapops.js PanelOps:Ets
//----------------------------------------------End of PanelOps:Ets


//should be moved to data population
function initializeContents() {
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
}

//tools.js UiOps.jsPanel.fn
function closepointUI() {
    debugger;

}

//mapops.js PanelOps:Common:fn
function creaateDatafromCSVGis() {
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
                let id = createPoint(inpData[0], wktPt, POINTTYPE.CREATED);
                undoOp.push(id);
                redoOp.push({"name": inpData[0], "geom": wktPt, "type": POINTTYPE.CREATED, "id": id});
                //map.getView().fit(vectorPoints.getSource().getExtent(), map.getSize());

            }
        }
        geomOp.preCreatePoint(false, undoOp, redoOp);
        debugger;
        //map.getView().fit(vectorPoints.getSource().getExtent(), map.getSize());
    } else if (category === "line") {
        linestr = linestr + ")";
        let lineData = {"geom": linestr, "type": LINETYPE.CREATED};
        geomOp.preCreateLine(lineData);
        vectorLineLayer.getSource().clear();
        previousline = null;
        clearInteractions();
    } else if (category === "polygon") {
        //stuffs for polygons
        //let polygonString="POLYGON ((7104975.396884786 3781405.145738764, 7104973.82746032 3781399.39196568, 7104979.62076032 3781397.40226568, 7104978.57046032 3781393.37336568, 7104977.90016032 3781392.33656568, 7104963.71046032 3781393.29256568, 7104953.88846032 3781398.95196568, 7104958.96766032 3781409.67346568, 7104958.967663735 3781409.673472613, 7104975.396884786 3781405.145738764))";
        polystr = polystr + "))";
        createPolygon(polystr);
    }
    closepointUI();
    $("#generatedpointstab").find("input[name='rawptchkbox']").each(function (i, data) {
        $(data).prop("checked", false);
    });
}

//mapops.js
function chooseDatafrommap() {
    if (pickFlag) {
        $("#pointpickerbtn").html("|>");
        if (generatedrawdata.length === 0) {
            alert('There is no ETS Points Loaded... PLease import ETSPoints first');
        } else {
            if (category === "point" || category === "line" || category === "polygon") {
                pointPicker();
            }
            pickFlag = false;
        }
    } else {
        $("#pointpickerbtn").html("|<");
        pickFlag = true;
    }
}

//mapops.js PanelOps:Common.fn
function pointPicker() {
    clearInteractions();
    pointerMoveSelectEvent = map.on('pointermove', function (e) {

        if (pickFlag) {
            clearTempGeom();
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
                        unbindPointerEvents();
                        let choosedpointname = feature.get("name");
                        let choosedpointID = feature.get("id");
                        let choosedpointFlatcoordinates = feature.get("geometry").flatCoordinates[0] + "," + feature.get("geometry").flatCoordinates[1];
                        let pointstring = choosedpointname + "," + choosedpointFlatcoordinates;
                        $("#csvgsidataarea").append(pointstring);
                        $("#csvgsidataarea").append("\n");
                        if (category === "line") {

                            if (previousline !== null) {
                                createtempline(previousline, [feature.get("geometry").flatCoordinates[0], feature.get("geometry").flatCoordinates[1]]);
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
                                createtempline(previousline, [feature.get("geometry").flatCoordinates[0], feature.get("geometry").flatCoordinates[1]]);
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
                        pointPicker();

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

}
//mapops.js GeomOps.
function createtempline(c1, c2) {

    let lName = "L" + (generatedData.lines.length + 1);
    let lns = new ol.geom.LineString([c1, c2]);
    debugger;
    let lnFeature = new ol.Feature({
        geometry: lns,
        name: lName,
        category: LINETYPE.CREATED,
        length: "" + lns.getLength().toFixed(2),
        id: createID(),
        type: 'LN'

    });
    vectorLineLayer.getSource().addFeature(lnFeature);

}
var hideGenPanel = 0;
function refreshPointsInDataDisplay() {
    if (loadedData === 'points') {
        grid.resetData(pointgridData);
    }

}
function refreshPolygonsInDataDisplay() {
    if (loadedData === 'polygons') {
        polygrid.resetData(polygongridData);
    }

}
function refreshLinesInDataDisplay() {
    if (loadedData === 'lines') {
        linegrid.resetData(linegridData);
    }
}
//panelops
function loadinserPointUi() {
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

    chooseDatafrommap();
}
function refreshrawPointsInDataDisplay() {
//        let points = generatedrawdata;
    let points = generatedData.ETSdata;
    if (points) {
        $("#rawpointtitle").removeClass("DN");
        let pointTabHtml = '';
        for (let i = 0; i < points.length; i++) {
            pointTabHtml += '<tr><td><input visibilityfactor="' + points[i].id + 'chkbox" type="checkbox" name="rawptchkbox" onchange=highlightOp.doHighlight("' + points[i].id + '","raw") id="' + points[i].id + '"></td><td>' + points[i].name + '</td>';
            pointTabHtml += '<td class="DN">' + points[i].id + '</td>' + '<td class="DN">' + points[i].geom + '</td><td>';
            pointTabHtml += '<button title="Delete Point" class="buttonclose mdc-icon-button material-icons" onclick=geomOp.preDeleterawPoint("' + points[i].id + '")>clear</button></td>';
            pointTabHtml += '<td width="15px"><div visiblility="true" onclick=rawdatahindeShow("' + points[i].id + '",this) ><i class="far fa-eye"></i></div></td></tr>';
        }

        $("#generatedpointstab").html(pointTabHtml);
    } else {
        $("#rawpointtitle").addClass("DN");
        hideGenPanel++;
    }
    if ($("#generatedpointstab").find("input[type=checkbox]:checked").length > 0) {
        $("#ptDeleteBtn").removeClass("DN");
    } else {
        $("#ptDeleteBtn").addClass("DN");
    }

}
//old split starts here
function initializeMap() {

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
    initializeLayers();//Initializing all the layers such as vectorPoints, vectorLines, vectorPolygon, tempLayer and etsLayer
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
                    bulkDelete('rawpoints');
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

}


function initializeLayers() {
    let features = []; //for polygon
    let ptFeatures = []; //for points
    let lnFeatures = []; //for lines
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

                }),
            });
        }
    });

//initializing vectorlines
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

//initializing vectorpolygon
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
                    }),
                })
            }
            );
        }
    });
    //initialize templayer
    if (tempLayer === null) {
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
    //initializing the ETS Layer
    if (etsLayer === null) {
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



    initMaps();


}
function initMaps() {
    if (map === null) {
        map = new ol.Map({
            controls: ol.control.defaults().extend([mousePositionControl]),
            layers: [vectorPolygon, vectorLines, vectorPoints, etsLayer, tempLayer],
            target: 'map',
            view: new ol.View({
            })
        });
    }

}

function insertPointpanelUI(name, category) {
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
                loadinserPointUi();
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
}

function pointUI() {
    if (panelPoint !== null) {
        panelPoint.close((id) => {
            panelPoint = null;
        });
    }
    panelPoint = jsPanel.create({
        iconfont: 'material-icons',
        headerTitle: 'Points',
        contentFetch: {
            resource: servicePath + "_point.html",
            done: function (response, panel) {
                panel.contentRemove();
                panel.content.append(jsPanel.strToHtml(response));
            }
        },
        position: 'right-top -5 80',
        theme: 'dark filleddark',
        contentSize: '500 450',
        headerControls: 'xs', // shorthand
        onclosed: function (panel, closedByUser) {
            panelPoint = null;
        }
    });
}

function deleteFeature() {//highlighting the feature 
    clearInteractions();
    pointerMoveSelectEvent = map.on('pointermove', function (e) {

        clearTempGeom();
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
                debugger;
//                console.log(feature.get("id") + " - " + feature.get("name") + " - " + feature.get("type"));
                var ty = feature.get("type");
                if (ty === 'PT') {
                    if (feature.get("category") === POINTTYPE.CREATED) {
                        unbindPointerEvents();
                        highlightOp.doCheckUncheck(feature.get("id"), "points");
//                        geomOp.preDeletePoint(feature.get("id"));
                    }

                } else if (ty === 'LN') {

                    if (feature.get("category") === POINTTYPE.CREATED) {
                        unbindPointerEvents();
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
}

function removeDrawInteraction() {
    map.removeInteraction(drawInteraction);
    map.removeInteraction(snapInteraction);
    drawInteraction = null;
    snapInteraction = null;
    document.removeEventListener('keydown', escapeDown);
}


function removeDeleteInteraction() {
    if (pointerMoveSelectEvent !== null) {
        ol.Observable.unByKey(pointerMoveSelectEvent);
    }
    if (pointerClickSelectEvent != null) {
        ol.Observable.unByKey(pointerClickSelectEvent);
    }
}

function clearInteractions() {
    clearTempGeom();
    removeDrawInteraction();
    removeDeleteInteraction();
}

function showTempGeom(geoms) {
    clearTempGeom();
    let features = [];
    geoms.forEach(function (geom) {
        let feature = new ol.Feature({
            geometry: geom,
            name: ""
        });
        features.push(feature);
    });
    tempLayer.getSource().addFeatures(features);
}

function unbindPointerEvents() {
    if (pointerMoveSelectEvent !== null) {
        ol.Observable.unByKey(pointerMoveSelectEvent);
    }
    if (pointerClickSelectEvent != null) {
        ol.Observable.unByKey(pointerClickSelectEvent);
    }
}
function clearTempGeom() {
    tempLayer.getSource().clear();
}


function createPoint(ptName, wktPoint, type, preFilledId) {
    let id = preFilledId;
    if (!id) {
        id = createID();
    }
    let ptFeature = new ol.Feature({
        geometry: _wktFormat.readGeometry(wktPoint),
        name: ptName,
        category: type,
        line: -1,
        id: id,
        type: 'PT'
    });
    debugger;
    vectorPoints.getSource().addFeature(ptFeature);
    referencePoints.push({"name": ptName, "geom": wktPoint, id: id});
    generatedData.points.push({"name": ptName, "geom": wktPoint, id: id});
    var tlem = pointgridData.length;
    pointgridData.push({"id": id, "actions": '<button onclick="someFunction(this)">check</button>', "slno": tlem + 1, "name": ptName, "geom": wktPoint, "details": category + " - " + pointtype});
    return id;
}
//create raw layer
function createRawPoints(ptName, wktPoint, type, preFilledId) {
    let id = preFilledId;
    if (!id) {
        id = createID();
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
//    referencePoints.push({"name": ptName, "geom": wktPoint, id: id});
    generatedData.ETSdata.push({"name": ptName, "geom": wktPoint, id: id});
    return id;
}

function removePoint(id) {
    clearTempGeom();
    referencePoints = removeFromArrayByAttr(referencePoints, "id", id);
    generatedData.points = removeFromArrayByAttr(generatedData.points, "id", id);
    pointgridData = removeFromArrayByAttr(pointgridData, "id", id);
    let features = vectorPoints.getSource().getFeatures();
    for (i = features.length - 1; i >= 0; i--) {
        if (features[i].get("id") === id) {
            vectorPoints.getSource().removeFeature(features[i]);
        }
    }
}

function removerawPoint(id) {
    clearTempGeom();
    generatedData.ETSdata = removeFromArrayByAttr(generatedData.ETSdata, "id", id);
    generatedrawdata = removeFromArrayByAttr(generatedrawdata, "id", id);
    let features = etsLayer.getSource().getFeatures();
    for (i = features.length - 1; i >= 0; i--) {
        if (features[i].get("id") === id) {
            etsLayer.getSource().removeFeature(features[i]);
        }
    }
}



function createLine(wktLine, type, preFilledId) {//LINESTRING(7104958.96766032 3781409.67346568,7104975.39688476 3781405.14573866)
    let id = preFilledId;
    if (!id) {
        id = createID();
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
}
function removeLine(id) {
    clearTempGeom();
    generatedData.lines = removeFromArrayByAttr(generatedData.lines, "id", id);
    linegridData = removeFromArrayByAttr(linegridData, "id", id);
    let features = vectorLines.getSource().getFeatures();
    for (i = features.length - 1; i >= 0; i--) {
        if (features[i].get("id") === id) {
            vectorLines.getSource().removeFeature(features[i]);
//            console.log(features[i].get("id") + " - " + features[i].get("name"));
        }
    }

//    clearGeneratedPolygons();
//    split();
}

function createPolygon(wktPoly, preFilledId) {
    debugger;
    let id = preFilledId;
    if (!id) {
        id = createID();
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
    refreshPolygonsInDataDisplay();
}
function clearGeneratedPolygons() {

    generatedData.polygons = removeFromArrayByAttr(generatedData.polygons, "category", POLYGONTYPE.CREATED);
    let features = vectorPolygon.getSource().getFeatures();
    for (i = features.length - 1; i >= 0; i--) {
        if (features[i].get("category") === POLYGONTYPE.CREATED) {
            vectorPolygon.getSource().removeFeature(features[i]);
        }
    }
}

function removeFromArrayByAttr(arr, attr, value) {
    var i = arr.length;
    while (i--) {
        if (arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value)) {

            arr.splice(i, 1);
        }
    }
    return arr;
}

function getDataById(type, id) {
    let reqData = generatedData[type];
    for (let i = 0; i < reqData.length; i++) {
        if (reqData[i].id === id) {
            return reqData[i];
        }
    }
}

function GetFeature(layer, gettype, getvalue) {
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
}

function getData(funName) {
    funName(generatedData);
}

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
//using precreate should pass data for doing undo/redo.
//param: logDataForCreate - should be called with data if it has to be logged
//       UseCase:  logDataForCreate should be passed undefined in bulk add/remove case
//param: dontCallAction - should be passed as true to not call action
var geomOp = {
    preDeleterawPoint: function (logDataForDeleteid, undoOpData, redoOpdata) {
        if (confirm("Are you sure to delete the selected raw data?")) {
            if (logDataForDeleteid) {
                undoOpData = [getDataById("points", logDataForDeleteid)];
                redoOpdata = [logDataForDeleteid];
                removerawPoint(logDataForDeleteid);
            }
            let logData = {
                "undoOp": undoOpData,
                "redoOp": redoOpdata,
                "type": OPERATION.ETSPOINT,
                "action": ACTION.DELETE
            };
            UndoRedo.logActions(logData);
            refreshrawPointsInDataDisplay();
        }
    },
    preDeletePoint: function (logDataForDeleteid, undoOpData, redoOpdata) {
        if (confirm("Are you sure to delete the selected data?")) {
            if (logDataForDeleteid) {
                undoOpData = [getDataById("points", logDataForDeleteid)];
                redoOpdata = [logDataForDeleteid];
                removePoint(logDataForDeleteid);
            }
            let logData = {
                "undoOp": undoOpData,
                "redoOp": redoOpdata,
                "type": OPERATION.POINT,
                "action": ACTION.DELETE
            };
            UndoRedo.logActions(logData);
            refreshPointsInDataDisplay();
        }
    },
    precreatePolygon: function (id) {
        refreshPolygonsInDataDisplay();
    },
    predeletePolygon: function (id) {
        refreshPolygonsInDataDisplay();
    },
    preDeleteLine: function (logDataForDeleteid, undoOpData, redoOpdata) {
        if (confirm("Are you sure to delete the selected data?")) {
            if (logDataForDeleteid) {
                undoOpData = [getDataById("lines", logDataForDeleteid)];
                redoOpdata = [logDataForDeleteid];
                removeLine(logDataForDeleteid);
            }
            let logData = {
                "undoOp": undoOpData,
                "redoOp": redoOpdata,
                "type": OPERATION.LINE,
                "action": ACTION.DELETE
            };
            UndoRedo.logActions(logData);
            refreshLinesInDataDisplay();
        }
    },
    preCreateRawPoint: function (logDataForCreate, undoOpData, redoOpData) {
        if (logDataForCreate) {
            let id = createRawPoints(logDataForCreate.name, logDataForCreate.geom, logDataForCreate.type);
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
            createToastalert("Successfull", "Successfully imported the data", ALERTS.SUCCESS);
        } catch (err) {
            console.log(" Error while closing the Import panel " + err);
            createToastalert("Error", "Something went wrong while importing the data", ALERTS.ERROR);
        }
        refreshrawPointsInDataDisplay();
    },
    preCreatePoint: function (logDataForCreate, undoOpData, redoOpData) {
        if (logDataForCreate) {
            let id = createPoint(logDataForCreate.name, logDataForCreate.geom, logDataForCreate.type);
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
        refreshPointsInDataDisplay();
    },
    preCreateLine: function (logDataForCreate, undoOpData, redoOpData) {
        if (logDataForCreate) {
            let generatedLine = createLine(logDataForCreate.geom, logDataForCreate.type);
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
        refreshLinesInDataDisplay();
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

function bulkDelete(type) {
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
}
//proxy service call
function saveData() {
    eval(initialData.button_conf.action)(generatedData, initialData);
}

function addGraticule() {
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
}
function removeGraticlue() {
    if (graticule !== null) {
        map.removeLayer(graticule);
        graticule = null;
    }
}
function initializelistontoolbar() {
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
}