function createRadio(name, axis) {
    var mydiv = document.getElementById("radiodiv_" + axis);
    var newbutton = document.createElement("input");
    newbutton.setAttribute("type", "radio");
    newbutton.setAttribute("name", "plotcheck_" + axis);
    newbutton.setAttribute("id", name);
    var newlabel = document.createElement("label");
    newlabel.appendChild(document.createTextNode("\n" + name));
    newlabel.setAttribute("for", name);
    mydiv.appendChild(newbutton);
    mydiv.appendChild(newlabel);
}

function spawnButtons(hot) {
    var cols = hot.countCols();
    console.log(cols);
    var moddiv = document.getElementById("moddiv");
    var modbutton = [];
    for (var i = 0; i < cols; i++) {
        var modbutton = document.createElement("button");
        modbutton.setAttribute("type", "button");
        modbutton.innerHTML = "mod button";
        moddiv.appendChild(modbutton);
    }
}

function getChecked(axis) {
    var boxes = document.getElementsByName("plotcheck_" + axis);
    var checked_boxes = [];
    for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            return boxes[i];
        }
    }
    return checked_boxes[0];
}

window.onload = function() {

    var container = document.getElementById("hot");

    var hot = new Handsontable(container, {
        //data: out,
        colHeaders: true,
        minSpareRows: 1,
        contextMenu: true,
        stretchH: "all"
    });

    $("#submitbutton").on("click", function() {


        ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R")

        var myfile = $("#csvfile")[0].files[0];

        if (!myfile) {
            alert("No file selected.");
            return;
        }

        $("#submitbutton").attr("disabled", "disabled");

        var req = ocpu.call("read.csv", {
            "file": myfile
        }, function(session) {

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out) {
                // WATCH
                hot.updateSettings({
                    colHeaders: Object.keys(out[0])
                })
                hot.loadData(out);
                spawnButtons(hot);
                // STOP WATCH

                // Get fields
                var fieldreq = ocpu.call("colnames", {
                    x: new ocpu.Snippet("data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "'))")
                }, function(fieldsession) {
                    fieldsession.getObject(function(obj) {
                        for (var i = 0; i < obj.length; i++) {
                            createRadio(obj[i], "x");
                            createRadio(obj[i], "y");
                        }
                    });
                });

                fieldreq.fail(function() {
                    alert(fieldreq.responseText);
                })

            });
        });

        req.fail(function() {
            alert("Fail: " + req.responseText);
        });

        req.always(function() {
            $("#submitbutton").removeAttr("disabled")
        });
    });

    $("#plotbutton").on("click", function() {

        ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

        var myfile = $("#csvfile")[0].files[0];

        if (!myfile) {
            alert("No file selected.");
            return;
        }

        $("#submitbutton").attr("disabled", "disabled");

        var req = ocpu.call("read.csv", {
            "file": myfile
        }, function(session) {

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out) {
                // Plot
                ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");
                var req2 = ocpu.call("make_chart", {
                    text: "nPlot(" + getChecked("y").id + " ~ " + getChecked("x").id + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = 'scatterChart')\n"
                }, function(session2) {
                    //$("#outputpic").attr('src', session2.getLoc() + "files/output.html");

                    session2.getConsole(function(outtxt) {
                        //$("#output").text(outtxt);
                        var url = session2.getLoc() + "files/output.html";
                        var jsonFile = new XMLHttpRequest();
                        jsonFile.open("GET", url, true);
                        jsonFile.send();
                        jsonFile.onreadystatechange = function() {
                                if (jsonFile.readyState == 4 && jsonFile.status == 200) {
                                    var plotbody = jsonFile.responseText;
                                    var plotarr = plotbody.split("<head>");
                                    var sq = '<head>\n<script type="text/javascript" src="js/squeezeFrame.js"></script>\n<script type="text/javascript">\n\tmyContainer="localhost/Helikar/index.html";\n\tmyMax=0.25;\n\tmyRedraw="both";\n</script>'
                                    $("#output").text(JSON.stringify(hot.getData()));
                                    //$("#outputpic").html(plotarr[0] + plotarr[1]);
                                    var outframe = document.getElementById("outputpic").contentWindow.document;
                                    outframe.open();
                                    outframe.write(plotarr[0] + sq + plotarr[1]);
                                    outframe.close();
                                }
                            }
                            //$("#output").text(file_get_contents(session2.getLoc() + "files/output.html"));
                    });
                });

                req2.fail(function() {
                    alert(req2.responseText);
                });

            });
        });

        req.fail(function() {
            alert("Fail: " + req.responseText);
        });

        req.always(function() {
            $("#submitbutton").removeAttr("disabled")
        });
    });

    $("#savebutton").on("click", function() {
        var jsonstring = JSON.stringify(hot.getData());
        var csvout = Papa.unparse(jsonstring);
        var myBlob = new Blob([csvout], {
            type: 'text/plain'
        });
        console.log(myBlob);
        saveAs(myBlob, "temp2.csv");
    });

    $("#modifybutton").on("click", function() {
        var col_arr = hot.getDataAtCol(0).filter(function(elem) {
            return elem != null;
        });
        // rescaling
        var min = Math.min.apply(null, col_arr);
        var max = Math.max.apply(null, col_arr);
        var col_arr = col_arr.map(function(elem) {
            return (elem - min) / (max - min);
        });
        var changes = [];
        for (var i = 0; i < col_arr.length; i++) {
            hot.setDataAtCell(i, 0, col_arr[i]);
        }
    });
}