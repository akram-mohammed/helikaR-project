function getOption(axis) {
	var select = document.getElementById("variable-select-" + axis);
	return select.options[select.selectedIndex].value;
}

function Column(functionName, preCol) {

    var sum = 0;
    var i;

    this.functionName = functionName;
    this.preCol = preCol;
    this.mean = this.preCol.reduce(function (a, b) { return a + b; }, 0) / this.preCol.length;

    for (i = 0; i < this.preCol.length; i++) {
        sum += Math.pow(this.preCol[i] - this.mean, 2);
    }

    this.variance = sum / this.preCol.length;
    this.sd = Math.sqrt(this.variance);

    // apply function by name
    this.applyFunction = function () {
        console.log(this.sd);
        return this[this.functionName]();
    };

    // Feature scaling
    this.fscale = function () {
        var min = Math.min.apply(null, this.preCol);
        var max = Math.max.apply(null, this.preCol);
        return this.preCol.map(function (elem) {
            return (elem - min) / (max - min);
        });
    };
}

var WholeThing = React.createClass(
{
	getInitialState: function() {
		return {file: "", data: [], path: ""};
	},

	getDefaultProps: function() {
		return {table: null, plot: false};
	},

	componentDidMount: function() {
		//var container = document.getElementById("hot");
		var container = React.findDOMNode(this.refs.hbut);

	    var hot = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});
		this.setProps({table: hot});

	},

	componentDidUpdate: function(prevProps, prevState) {

		if(this.state.file !== prevState.file)
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

	        		var headers = Object.keys(out[0]);
	        		var hot = this.props.table;

	                hot.updateSettings({
                    colHeaders: function (col) {
                        // GHETTO - change later if necessary
                        // Sets markup of each column header 
                        return "<b>" + headers[col] + "</b>" + "<button class='mod_button' name='" + col + "' style='margin-left: 10%;'>\u25BC</button>";
                    	}
                	});

        			var container = React.findDOMNode(this.refs.hbut);
	                Handsontable.Dom.addEvent(container, 'click', function (event) {
	                    if (event.target.className === 'mod_button') {
	                    	console.log("Aha!");
	                        var preDiv = React.findDOMNode(this.refs.panel);

	                        // slide up current div to show a visual change
	                        $(preDiv).slideUp("fast");
	                        $(preDiv).slideDown("slow");

	                        // TODO: remove global scope
	                        preColumnNum = Number(event.target.getAttribute("name"));
	                    }
               		}.bind(this));

                	// load data
                	hot.loadData(out);


    				this.setState({csv: main_out});

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
	    }

	    else {

	    }  

	    if(this.props.plot === true) {
	    	ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	        // plot
	        var readRequest = ocpu.call("read.csv", {
	        	"file": this.state.file
	        }, function (session) {

	        	ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

	        	var hot = this.props.table;
	     		console.log(hot.getData());
	        	session.getObject(function () {
	            	// plot functions
		            ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");

		            console.log(getOption("y"));

		            var requestText = "nPlot(" + getOption("y") + " ~ " + getOption("x") + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = 'scatterChart')\n";

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
	        // this.setState({file: ""});
	        this.setProps({plot: false});
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
	        	<ChoicePanel choices={this.state.data} axis="y" />
	        	<div id="plot-panel">
	        		<PlotWindow path={this.state.path} />
	        	</div>
	        	<HButton ref="hbut" />
	        	<ModificationPanel onClick={this.handleClick} ref="panel" />
        	</div>
        	);
	},

	handleClick: function(child, buttonType, functionName) {
		if(buttonType === "submit") {
			var myFile = $("#input-file")[0].files[0];
			this.setState({file: myFile});
		}

		else if(buttonType === "modify") {
			var i;
			var hot = this.props.table;
			console.log(hot);
	     	var preColArr = hot.getDataAtCol(preColumnNum).filter(function (elem) {
	            return elem !== null;
	        });
	     	console.log("ARR!!" + preColArr);

	        preColArr = new Column(functionName, preColArr);
	        var postColArr = preColArr.applyFunction();
	        for (i = 0; i < postColArr.length; i++) {
	            hot.setDataAtCell(i, preColumnNum, postColArr[i]);
	        }
		}

		else {
			this.setProps({plot: true});
			this.forceUpdate();
		}

	}
});

var ModificationPanel = React.createClass({
	handleClick: function(child, buttonType, functionName) {
		this.props.onClick(this, buttonType, functionName);
	},

	render: function() {
		return (
			<div id="pre-button-div" style={{display: 'none'}}>
				<ModificationButton onClick={this.handleClick} id="fscale" />
	    	</div>
		);
	}
});

var ModificationButton = React.createClass(
{
	handleClick: function(buttonType, functionName) {
		this.props.onClick(this, buttonType, functionName);
	},

	render: function() {
		return (
			<button id="{this.props.id}" onClick={this.handleClick.bind(this, "modify", this.props.id)}>this.props.name</button>
		);
	}
});

var HButton = React.createClass({
	render: function() {
		return (
			<div></div>
		);
	}
});

var FileUploader = React.createClass(
{
	handleClick: function(buttonType) {
		this.props.onClick(this, buttonType);
	},

	render: function() {
		return (
			<div>
			<input type="file" id="input-file"></input>
			<button id="submit-button" type="button" onClick={this.handleClick.bind(this, "submit")}>Upload</button>
			<button id="plot-button" type="button" onClick={this.handleClick.bind(this, "plot")}>Plot</button>
			</div>
			);
	}
});

var PlotWindow = React.createClass(
{
	render: function() {
		var url = this.props.path;
		if(url !== "")
		{
			var jsonFile = new XMLHttpRequest();
			jsonFile.open("GET", url, true);
			jsonFile.send();
			jsonFile.onreadystatechange = function () {
				if (jsonFile.readyState === 4 && jsonFile.status === 200) {
					var plotHTML = jsonFile.responseText;
					var plotArr = plotHTML.split("<head>");

					//temp static stuff
					var squeezeFrame = '<head>\n<script type="text/javascript" src="js/squeezeFrame.js"></script>\n<script type="text/javascript">\n\tmyContainer="localhost/Statistical Computing/components.html";\n\tmyMax=0.25;\n\tmyRedraw="both";\n</script>';

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
		else {
			return (
				<iframe id="plot-frame"></iframe>
				);
		}
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
			<select id={"variable-select-" + this.props.axis}>{clist}</select>
		);
	}
});

var Table = React.createClass(
{	
	componentDidMount: function() {
		var container = document.getElementById("hot");
	    var hot = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});
	},
	render: function() {
		return (
			<div id="hot"></div>
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

//React.render(<PlotWindow path="temp.html" />, document.body);

React.render(<WholeThing />, document.body);

/*$("#submit-button").click(function (event) {
	var myFile = $("#input-file")[0].files[0];
	React.render(<WholeThing file = {myFile} />, document.body);
});*/
