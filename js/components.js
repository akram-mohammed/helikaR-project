function getChecked(axis) {
	var select = document.getElementsByName("variable-select-" + axis);
	return select.options[select.selectedIndex].value;
}




var WholeThing = React.createClass(
{

	getInitialState: function() {
		return {file: "", data: [], path: ""};
	},

	componentDidMount: function() {

		if(this.state.file !== "")
		{
			var choices = [];
			var main_out;

			ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	        // upload
	        var uploadRequest = ocpu.call("read.csv", {
	        	"file": this.state.file
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
	        					choices.push({name: obj[i], axis: "x"});
	        					choices.push({name: obj[i], axis: "y"});
	        				}
	        				this.setState({data: choices});
	        			}.bind(this));
	        		}.bind(this));
	        	}.bind(this));
	        }.bind(this));
	        // ^wat

	        var readRequest = ocpu.call("read.csv", {
	        	"file": this.state.file
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
	    }
	    else {
	    	
	    }
    },

    render: function() {
    	return (
        	// get radio buttons
        	<div>
        	<FileUploader onClick={this.handleClick} />
        	<ChoicePanel choices={this.state.data} axis="x" />
        	<PlotWindow path={this.state.path} />
        	<ChoicePanel choices={this.state.data} axis="y" />
        	</div>
        	);
    },

    handleClick: function() {
		var myFile = $("#input-file")[0].files[0];
		console.log(myFile);
    	this.setState({file: myFile});
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

var ChoicePanel = React.createClass(
{
	render: function() {
		var clist = [];
		this.props.choices.forEach(function(choice) {
			if(choice.axis === this.props.axis)
				clist.push(	<option name={choice.axis} id={choice.name}>
					{choice.name}
					</option>);
		}.bind(this));
		return (
			<select id="variable-select-{this.props.axis}">{clist}</select>
			);
	}
});

var FileUploader = React.createClass(
{
	handleClick: function(event) {
		this.props.onClick(this);
	},

	render: function() {
		return (
			<div>
			<input type="file" id="input-file"></input>
			<button id="submit-button" type="button" onClick={this.handleClick}>Upload</button>
			</div>
		);
	}
})

// Static, for now
var ch = [
{name: "firqst", axis: "x"},
{name: "second", axis: "x"},
{name: "first", axis: "y"},
{name: "third", axis: "y"}
];

//React.render(<PlotWindow path="temp.html" />, document.body);

React.render(<WholeThing />, document.body);

/*$("#submit-button").click(function (event) {
	var myFile = $("#input-file")[0].files[0];
	React.render(<WholeThing file = {myFile} />, document.body);
});*/
