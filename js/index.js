window.onload = function() 
{
ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R")

$("#submitbutton").on("click", function(){

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

        session.getObject(function(out)
        {
            ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");
            var req2 = ocpu.call("make_chart", {
                text: "nPlot(TNFR1 ~ PI3K, data = data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "')), type = 'scatterChart')\n"
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
