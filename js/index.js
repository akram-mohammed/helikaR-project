function createRadio(name, axis)
{
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

function getChecked(axis)
{
    var boxes = document.getElementsByName("plotcheck_" + axis);
    var checked_boxes = [];
    for (var i = 0; i < boxes.length; i++)
    {
        if(boxes[i].checked) {
            return boxes[i];
        }
    }
    return checked_boxes[0];
}

window.onload = function() 
{

    var container = document.getElementById("hot");
    var hot = new Handsontable(container, 
    {
        //data: out,
        colHeaders: true,
        minSpareRows: 1,
        contextMenu: true,
        className: "htCenter"
    });


    $("#submitbutton").on("click", function(){

        ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R")

        var myfile = $("#csvfile")[0].files[0];
        
        if(!myfile){
            alert("No file selected.");
            return;
        }

        $("#submitbutton").attr("disabled", "disabled");

        var req = ocpu.call("read.csv", {
            "file" : myfile
        }, function(session){

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out)
            {
                // WATCH
                hot.loadData(out);
                // STOP WATCH

                // Get fields
                var fieldreq = ocpu.call("colnames", {
                    x: new ocpu.Snippet("data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "'))")
                }, function(fieldsession) {
                    fieldsession.getObject(function(obj)
                    {
                        for(var i = 0; i < obj.length; i++)
                        {
                            createRadio(obj[i], "x");
                            createRadio(obj[i], "y");
                        }
                    });
                });

                fieldreq.fail(function()
                {
                    alert(fieldreq.responseText);
                })

            });
        });
        
        req.fail(function(){
            alert("Fail: " + req.responseText);
        });

        req.always(function(){
            $("#submitbutton").removeAttr("disabled")
        });        
    });

    $("#plotbutton").on("click", function(){

        ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

        var myfile = $("#csvfile")[0].files[0];
        
        if(!myfile){
            alert("No file selected.");
            return;
        }

        $("#submitbutton").attr("disabled", "disabled");

        var req = ocpu.call("read.csv", {
            "file" : myfile
        }, function(session){

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out)
            {
                // Plot
                ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");
                var req2 = ocpu.call("make_chart", {
                    text: "nPlot(" + getChecked("y").id + " ~ " + getChecked("x").id + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = 'scatterChart')\n"
                }, function(session2) {
                    $("#outputpic").attr('src', session2.getLoc() + "files/output.html");

                    session2.getConsole(function(outtxt) {
                        $("#output").text(outtxt);
                    });
                });

                req2.fail(function() {
                    alert(req2.responseText);
                });

            });
        });
        
        req.fail(function(){
            alert("Fail: " + req.responseText);
        });

        req.always(function(){
            $("#submitbutton").removeAttr("disabled")
        });        
    });
   
}
