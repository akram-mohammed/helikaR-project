function createRadio(name)
{
    var mydiv = document.getElementById("radiodiv");
    var newbutton = document.createElement("input");
    newbutton.setAttribute("type", "checkbox");
    newbutton.setAttribute("name", "plotcheck");
    newbutton.setAttribute("id", name);
    var newlabel = document.createElement("label");
    newlabel.appendChild(document.createTextNode(name));
    newlabel.setAttribute("for", name);
    mydiv.appendChild(newbutton);
    mydiv.appendChild(newlabel);
}

function getChecked()
{
    var boxes = document.getElementsByName("plotcheck");
    var checked_boxes = [];
    for (var i = 0; i < boxes.length; i++)
    {
        if(boxes[i].checked) {
            checked_boxes.push(boxes[i]);
        }
    }
    return checked_boxes;
}

window.onload = function() 
{

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

            session.getConsole(function(outtxt){
                console.log(outtxt); 
            });

            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

            session.getObject(function(out)
            {
                console.log("AHA!!!");
                // Get fields
                var fieldreq = ocpu.call("colnames", {
                    x: new ocpu.Snippet("data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "'))")
                }, function(fieldsession) {
                    fieldsession.getObject(function(obj)
                    {
                        for(var i = 0; i < obj.length; i++)
                        {
                            createRadio(obj[i]);
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
                console.log("WOLOLO");
                var boxes = getChecked();
                console.log(boxes.length);      

                for(var i = 0; i < boxes.length; i++)
                {
                    console.log(boxes[i].id);
                }
                ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");
                var req2 = ocpu.call("make_chart", {
                    text: "nPlot(" + boxes[0].id + " ~ " + boxes[1].id + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "')), type = 'scatterChart')\n"
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
