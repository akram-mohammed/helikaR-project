/*
 *	NEEDS MAJOR REFACTORING. RADIOACTIVE, HANDLE WITH CARE.
 */ 

 function getChecked(axis) {
 	var i;
 	var boxes = document.getElementsByName("variable-" + axis);
 	for (i = 0; i < boxes.length; i++) {
 		if (boxes[i].checked) {
 			return boxes[i];
 		}
 	}
 }


 var FileUploader = React.createClass(
 {
 	render: function() {
 		return (
 			<div>
 			<input type="file" id="input-file"></input>
 			<button id="submit-button" type="button">Upload</button>
 			</div>
 			);
 	}
 })


 var WholeThing = React.createClass(
 {

 	getInitialState: function() {
 		return {data: [], path: ""};
 	},

 	componentDidMount: function() {

 		var radios = [];
 		var main_out;

 		ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

        // upload
        var uploadRequest = ocpu.call("read.csv", {
        	"file": this.props.file
        }, function (session) {
        	ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

        	session.getObject(function (out) {
	            ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

        		main_out = out;
        		var radioRequest = ocpu.call("colnames", {
        			x: new ocpu.Snippet("data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "'))")
        		}, function (fieldsession) {

        			fieldsession.getObject(function (obj) {
        				var i;
        				for (i = 0; i < obj.length; i++) {
        					radios.push({name: obj[i], axis: "x"});
        					radios.push({name: obj[i], axis: "y"});
        				}
        				this.setState({data: radios});
        			}.bind(this));
        		}.bind(this));
        	}.bind(this));
        }.bind(this));
        // ^wat

        var readRequest = ocpu.call("read.csv", {
        	"file": this.props.file
        }, function (session) {

        	ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

        	session.getObject(function () {
            // plot functions
	            ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");
	            var requestText = "nPlot(Weight ~ Height, data = data.frame(jsonlite::fromJSON('[{\"Height\": 20, \"Weight\": 40}, {\"Height\": 40, \"Weight\": 60}, {\"Height\": 60, \"Weight\": 10}]')), type = 'scatterChart')\n";

	            var plotRequest = ocpu.call("make_chart", {
	            	text: requestText
	            }, function(session2) {
	            	session2.getConsole(function () {
	            		var url = session2.getLoc() + "files/output.html";
	            		this.setState({path: url});
	            	}.bind(this));
	            }.bind(this));
	        }.bind(this));
        }.bind(this));
    },

    render: function() {
    	return (
        	// get radio buttons
        	<div>
        	<ChoicePanel choices={this.state.data} axis="x" />
        	<PlotWindow path={this.state.path} />
        	<ChoicePanel choices={this.state.data} axis="y" />
        	</div>
        	);
    }
});

var PlotWindow = React.createClass(
{
	render: function() {
		var url = this.props.path;
		var jsonFile = new XMLHttpRequest();
		jsonFile.open("GET", url, true);
		jsonFile.send();
		jsonFile.onreadystatechange = function () {
			if (jsonFile.readyState === 4 && jsonFile.status === 200) {
				var plotHTML = jsonFile.responseText;
				var plotArr = plotHTML.split("<head>");

				//temp static stuff
				var squeezeFrame = '<head>\n<script type="text/javascript" src="js/squeezeFrame.js"></script>\n<script type="text/javascript">\n\tmyContainer="localhost/Statistical%20Computing/components.html.html";\n\tmyMax=0.25;\n\tmyRedraw="both";\n</script>';

				var plotFrame = document.getElementById("plot-frame").contentWindow.document;

				plotFrame.open();
				plotFrame.write(plotArr[0] + squeezeFrame + plotArr[1]);
				plotFrame.close();
			}
		}
		return (
			<iframe id="plot-frame"></iframe>
			);
	}
});

var VarChoice = React.createClass(
{
	render: function() {
		return (
			<p>
			<input type="radio" name="{this.props.axis}" id="{this.props.name}">
			</input>
			<label r="{this.props.name}">
			<br>{this.props.name}</br>
			</label>
			</p>
			);
	}
});

var ChoicePanel = React.createClass(
{
	render: function() {
		var clist = [];
		this.props.choices.forEach(function(choice) {
			if(choice.axis === this.props.axis)
				clist.push(<VarChoice name={choice.name} axis={choice.axis} />);
		}.bind(this));
		return (
			<p>{clist}</p>
			);
	}
});

// Static, for now
var ch = [
{name: "first", axis: "x"},
{name: "second", axis: "x"},
{name: "first", axis: "y"},
{name: "third", axis: "y"}
];

//React.render(<ChoicePanel choices={ch} />, document.body);

//React.render(<PlotWindow path="temp.html" />, document.body);

React.render(<FileUploader />, document.body);

$("#submit-button").click(function (event) {
	var myFile = $("#input-file")[0].files[0];
	React.render(<WholeThing file = {myFile} />, document.body);
});