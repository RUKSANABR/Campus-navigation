
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
        debugger;
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
            toggleclass('slide-in-data', 'show');
        },
        generatedDataShow: function () {
            toggleclass('slide-in-dataRight', 'show');
        },
        togglemenuBar: function () {
            toggleclass('menubarPane', 'dotoggle');
            toggleclass('attributeHamberger', 'content-to-bottom');
            toggleclass('tayertypes', 'content-to-bottom');
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
        },
        clearSelectedMenu: function () {
            grid.resetData(pointgridData);
            linegrid.resetData(linegridData);
            polygrid.resetData(polygongridData);
            clearInteractions();
        }
    }
};

