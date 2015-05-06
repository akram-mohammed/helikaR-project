// column class (for preprocessing)
// don't need this now
/*function Column(functionName, preCol) {
    this.functionName = functionName;
    this.preCol = preCol;
    this.applyFunction = function() {
        return this[this.functionName](this.preCol);
    };
    this.addone = function() {

    };
}*/


// Create radio buttons for variables to be plotted
function createRadio(name, axis) {
    var plotVariableDiv = document.getElementById("radiodiv_" + axis);
    var plotVariableCheck = document.createElement("input");
    plotVariableCheck.setAttribute("type", "radio");
    plotVariableCheck.setAttribute("name", "plotcheck_" + axis);
    plotVariableCheck.setAttribute("id", name);
    var plotVariableLabel = document.createElement("label");
    plotVariableLabel.appendChild(document.createTextNode("\n" + name));
    plotVariableLabel.setAttribute("for", name);
    plotVariableDiv.appendChild(plotVariableCheck);
    plotVariableDiv.appendChild(plotVariableLabel);
}

// Get checked variables in the pane
function getChecked(axis) {
    var boxes = document.getElementsByName("plotcheck_" + axis);
    for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            return boxes[i];
        }
    }
}

window.onload = function() {

    var preColumnNum;

    var container = document.getElementById("hot");
    var hot = new Handsontable(container, {
        colHeaders: true,
        minSpareRows: 1,
        contextMenu: true,
        stretchH: "all"
    });

    $("#submitbutton").click(function() {

        ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R")

        var myFile = $("#csvfile")[0].files[0];

        if (!myFile) {
            alert("No file selected.");
            return;
        }

        $("#submitbutton").attr("disabled", "disabled");

        var uploadRequest = ocpu.call("read.csv", {
            "file": myFile
        }, function(session) {

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out) {
                // WATCH
                var headers = Object.keys(out[0]);

                hot.updateSettings({
                    colHeaders: function(col) {
                        // GHETTO - change later if necessary
                        // Sets markup of each column header 
                        return "<b>" + headers[col] + "</b>" + "<button class='mod_button' name='" + col + "' style='margin-left: 10%;'>\u25BC</button>";
                    }
                });

                // add click event to header buttons
                Handsontable.Dom.addEvent(container, 'click', function(event) {
                    if (event.target.className == 'mod_button') {
                        var preDiv = document.getElementById("moddiv");

                        // slide up current div to show a visual change
                        $(preDiv).slideUp("fast");
                        $(preDiv).slideDown("slow");

                        // TODO: remove global scope
                        preColumnNum = Number(event.target.getAttribute("name"));
                    }
                });

                // load data
                hot.loadData(out);

                // get fields, create radio buttons
                var radioRequest = ocpu.call("colnames", {
                    x: new ocpu.Snippet("data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "'))")
                }, function(fieldsession) {
                    fieldsession.getObject(function(obj) {
                        for (var i = 0; i < obj.length; i++) {
                            createRadio(obj[i], "x");
                            createRadio(obj[i], "y");
                        }
                    });
                });

                radioRequest.fail(function() {
                    alert(radioRequest.responseText);
                })

            });
        });

        uploadRequest.fail(function() {
            alert("Fail: " + uploadRequest.responseText);
        });

        uploadRequest.always(function() {
            $("#submitbutton").removeAttr("disabled")
        });
    });

    $("#plotbutton").click(function() {

        ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

        var myFile = $("#csvfile")[0].files[0];

        if (!myFile) {
            alert("No file selected.");
            return;
        }

        $("#submitbutton").attr("disabled", "disabled");

        var readRequest = ocpu.call("read.csv", {
            "file": myFile
        }, function(session) {

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out) {
                // plot functions
                ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");
                var plotRequest = ocpu.call("make_chart", {
                    text: "nPlot(" + getChecked("y").id + " ~ " + getChecked("x").id + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = 'scatterChart')\n"
                }, function(session2) {
                    session2.getConsole(function(outtxt) {

                        // plot is saved in this file
                        var url = session2.getLoc() + "files/output.html";
                        var jsonFile = new XMLHttpRequest();

                        // get output file
                        jsonFile.open("GET", url, true);
                        jsonFile.send();
                        jsonFile.onreadystatechange = function() {
                                if (jsonFile.readyState == 4 && jsonFile.status == 200) {
                                    // get HTML content of file
                                    var plotHTML = jsonFile.responseText;
                                    var plotArr = plotHTML.split("<head>");
                                    var plotFrame = document.getElementById("outputpic").contentWindow.document;

                                    // squeezeframe.js code to be injected
                                    var squeezeFrame = '<head>\n<script type="text/javascript" src="js/squeezeFrame.js"></script>\n<script type="text/javascript">\n\tmyContainer="localhost/Helikar/index.html";\n\tmyMax=0.25;\n\tmyRedraw="both";\n</script>';

                                    // open iframe to write to
                                    plotFrame.open();
                                    plotFrame.write(plotArr[0] + squeezeFrame + plotArr[1]);
                                    plotFrame.close();
                                }
                            }
                    });
                });

                plotRequest.fail(function() {
                    alert(plotRequest.responseText);
                });

            });
        });

        readRequest.fail(function() {
            alert("Fail: " + readRequest.responseText);
        });

        readRequest.always(function() {
            $("#submitbutton").removeAttr("disabled")
        });
    });

    $("#savebutton").click(function() {
        var dataJSON = JSON.stringify(hot.getData());
        var dataCSV = Papa.unparse(dataJSON);
        var dataBlob = new Blob([dataCSV], {
            type: 'text/plain'
        });
        saveAs(dataBlob, "temp2.csv");
    });

    // TODO: encapsulate into class
    $("#fscale").click(function() {
        var preColArr = hot.getDataAtCol(preColumnNum).filter(function(elem) {
            return elem != null;
        });
        // rescaling
        var min = Math.min.apply(null, preColArr);
        var max = Math.max.apply(null, preColArr);
        var preColArr = preColArr.map(function(elem) {
            return (elem - min) / (max - min);
        });
        for (var i = 0; i < preColArr.length; i++) {
            hot.setDataAtCell(i, preColumnNum, preColArr[i]);
        }
    });

}
