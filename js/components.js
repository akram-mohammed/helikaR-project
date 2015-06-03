function getOption(axis) {
	var select = document.getElementById("variable-select-" + axis);
	return select.options[select.selectedIndex].value;
}

function Column(functionName, preCol) {

    var sum = 0;
    var i;

    this.functionName = functionName;
    this.preCol = preCol;
    this.sortedCol = preCol;
    this.sortedCol.sort();
    this.mean = this.preCol.reduce(function (a, b) { return a + b; }, 0) / this.preCol.length;
    this.median = 0;	// init

    var length = this.preCol.length - 1;
    if(length % 2 === 0) {
    	this.median = this.sortedCol[length / 2];
    	console.log("Easy");
    }
    else {
    	var low = this.sortedCol[(length - 1) / 2];
    	var high = this.sortedCol[(length + 1) / 2];
    	this.median = (low + high) / 2;
    	console.log("Hard");
    }


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

    this.getProperty = function() {
    	return this[this.functionName];
    }

    this.getLength = function() {
    	return this.preCol.length;
    }

    // Feature scaling
    this.fscale = function () {
        var min = Math.min.apply(null, this.preCol);
        var max = Math.max.apply(null, this.preCol);
        return this.preCol.map(function (elem) {
            return (elem - min) / (max - min);
        });
    };

}

/*
 *	The entire interface
 */

var WholeThing = React.createClass(
{
	getInitialState: function() {
		return {file: "", data: [], path: ""};
	},

	getDefaultProps: function() {
		return {table: null, plot: false};
	},

	componentDidMount: function() {
		var container = React.findDOMNode(this.refs.table_container);

	    var hot = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});
		this.setProps({table: hot});

	},

	componentDidUpdate: function(prevProps, prevState) {

		// State is updated with a new file on clicking upload
		if(this.state.file !== prevState.file)
		{			
			ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	        // upload
	        var uploadRequest = ocpu.call("read.csv", {
	        	"file": this.state.file
	        }, function (session) {

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

        			var container = React.findDOMNode(this.refs.table_container);
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

	        		var radioRequest = ocpu.call("colnames", {
	        			x: new ocpu.Snippet("data.frame(jsonlite::fromJSON('" + JSON.stringify(out) + "'))")
	        		}, function (fieldsession) {

	        			fieldsession.getObject(function (obj) {
	        				var i;
	        				var choices = [];
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
	        this.setProps({plot: false});
	    }
	},

	render: function() {
		return (
        	<div>
	        	<FileUploader onClick={this.handleClick} />
	        	<ChoicePanel choices={this.state.data} axis="x" />
	        	<ChoicePanel choices={this.state.data} axis="y" />
	        	<div id="plot-panel">
	        		<PlotWindow path={this.state.path} />
	        	</div>
	        	<HTable ref="table_container" />
	        	<ModificationPanel onClick={this.handleClick} ref="panel" />
        	</div>
        	);
	},

	handleClick: function(child, buttonType, functionName, propertyName) {

		// clicked on Submit
		if(buttonType === "submit") {
			var myFile = $("#input-file")[0].files[0];
			this.setState({file: myFile});
		}

		// column modifiers
		else if(buttonType === "modify") {
			var i;
			var hot = this.props.table;
			console.log(hot);
	     	var preColArr = hot.getDataAtCol(preColumnNum).filter(function (elem) {
	            return typeof(elem) === "number";
	        });
	     	console.log("ARR!!" + preColArr);

	        preColArr = new Column(functionName, preColArr);
	        var postColArr = preColArr.applyFunction();
	        for (i = 0; i < postColArr.length; i++) {
	            hot.setDataAtCell(i, preColumnNum, postColArr[i]);
	        }
		}

		// descriptive statistics
		else if(buttonType === "descriptive") {
			var hot = this.props.table;

			var preColArr = hot.getDataAtCol(preColumnNum).map(function (elem) {
	        	return parseInt(elem);
	        });

	        console.log(preColArr);

	        preColArr = preColArr.filter(function (elem) {
	        	return !isNaN(elem);
	        })

	        console.log(preColArr);

	        preColArr = new Column(functionName, preColArr);
	        var out = preColArr.getProperty();

	        // check if already exists:
	        /*	MEH
	        var out_string = "Mean: " + out;
	        var push = false;
	        for (i = 0; i < hot.countRows(); i++)
	        {
	        	var dat = hot.getDataAtCell(i, preColumnNum);
	        	if(!push) {
		        	if(dat === out_string) {
		        		hot.setDataAtCell(i, preColumnNum, "");
		        		push = true;
		        	}
	        	}
	        	else {
	        		//hot.setDataAtCell(i - 1, preColumnNum, dat);
	        	}
	        }

	        if(!push)*/

	        hot.setDataAtCell(hot.countRows() - 1, preColumnNum, propertyName + ": " + out);
		}

		// plot
		else {
			this.setProps({plot: true});
			this.forceUpdate();
		}

	}
});

/*
 *	The panel with the modification buttons
 */

var ModificationPanel = React.createClass({
	handleClick: function(child, buttonType, functionName, propertyName) {
		this.props.onClick(this, buttonType, functionName, propertyName);
	},

	render: function() {
		return (
			<div id="pre-button-div" style={{display: 'none'}}>
				<ColumnModifier onClick={this.handleClick} id="fscale" name="Feature scaling" />
				<DescriptiveViewer onClick={this.handleClick} id="mean" name="Mean" />
				<DescriptiveViewer onClick={this.handleClick} id="median" name="Median" />
				<DescriptiveViewer onClick={this.handleClick} id="mode"	name="Mode"	/>
				<DescriptiveViewer onClick={this.handleClick} id="sd"	name="Standard deviation" />
				<DescriptiveViewer onClick={this.handleClick} id="variance" name="Variance"	/>
	    	</div>
		);
	}
});

/*
 *	Buttons that apply normalisation functions to a whole column
 */

var ColumnModifier = React.createClass(
{
	handleClick: function(buttonType, functionName) {
		this.props.onClick(this, buttonType, functionName);
	},

	render: function() {
		return (
			<button id="{this.props.id}" onClick={this.handleClick.bind(this, "modify", this.props.id)}>{this.props.name}</button>
		);
	}
});

var DescriptiveViewer = React.createClass(
{
	handleClick: function(buttonType, functionName, propertyName) {
		this.props.onClick(this, buttonType, functionName, propertyName);
	},

	render: function() {
		return(
			<button id="{this.props.id}" onClick={this.handleClick.bind(this, "descriptive", this.props.id, this.props.name)}>{this.props.name}</button>
		);
	}
});

/*
 *	Div for handsontable
 */

var HTable = React.createClass({
	render: function() {
		return (
			<div></div>
		);
	}
});

/*
 *	Upload and plot buttons
 */

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

/*
 *	The plot frame
 */

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

/*
 *	Variable plot selects
 */

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

React.render(<WholeThing />, document.body);

