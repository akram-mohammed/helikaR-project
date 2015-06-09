var Alert = ReactBootstrap.Alert;
var Navbar = ReactBootstrap.Navbar,
Button = ReactBootstrap.Button,
Nav = ReactBootstrap.Nav,
NavItem = ReactBootstrap.NavItem,
DropdownButton = ReactBootstrap.DropdownButton,
MenuItem = ReactBootstrap.MenuItem,
Modal = ReactBootstrap.Modal,
ModalTrigger = ReactBootstrap.ModalTrigger,
Input = ReactBootstrap.Input;

function getOption(axis) {
	var select = document.getElementById("variable-select-" + axis);
	return select.options[select.selectedIndex].value;
}

function Column(functionName, preCol) {

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
    }
    else {
    	var low = this.sortedCol[(length - 1) / 2];
    	var high = this.sortedCol[(length + 1) / 2];
    	this.median = (low + high) / 2;
    }

    this.getCentralMoment = function(n) {
    	var sum = 0;
    	for (i = 0; i < this.preCol.length; i++) {
    		var temp = Math.pow(this.preCol[i] - this.mean, n);
        	sum += temp;
        }
        return sum / (this.preCol.length - 1);
    }

    this.variance = this.getCentralMoment(2);
    this.sd = Math.sqrt(this.variance);


    this.skewness = this.getCentralMoment(3) / Math.pow(this.sd, 3);
    this.kurtosis = this.getCentralMoment(4) / Math.pow(this.sd, 4);
   	 
    // apply function by name
    this.applyFunction = function () {
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

function getIndex(table, str) {
	var headers = table.getColHeader();
	for(var i = 0; i < headers.length; i++) {
		if(headers[i].indexOf(str) > -1) {
			return i;
		}
	}
}
	
/*
 *	The entire interface
 */

var WholeThing = React.createClass(
{
	getInitialState: function() {
		return {file: "", data: [], path: "", variables: []};
	},

	getDefaultProps: function() {
		return {table: null, plot: false, showTable: false};
	},

	/*componentWillMount: function() {
	    var hot = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});
    	this.setProps({table: hot}); 
	},
	*/

	componentDidMount: function() {
		var container = React.findDOMNode(this.refs.table_container);

	    
	    var hot = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});

		this.setProps({table: hot});

		container = React.findDOMNode(this.refs.stats_table);

		hot = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 5
		});

		this.setProps({stats_table: hot});
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
	        		this.setState({variables: headers});
	       
                	this.refs.table_container.setHeaders(headers);
                	this.refs.table_container.setData(out);


        			/*var container = React.findDOMNode(this.refs.table_container);
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
					*/


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
	        	var type = this.props.plot_type;
	        	console.log(type);
	     		// console.log(hot.getData());
	        	session.getObject(function () {
	            	// plot functions
		            ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");


		            var requestText = "nPlot(" + getOption("y") + " ~ " + getOption("x") + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = '" + this.props.plot_type + "')\n";

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

	//ugly function thing
	handleClick: function(child, buttonType, functionName, propertyName, plotType) {

		// clicked on Submit
		if(buttonType === "submit") {
			var myFile = $("#invis-file")[0].files[0];
			console.log(myFile);
			this.setState({file: myFile});
		}

		// toggle HOT
		else if(buttonType === "show-table") {
			/*this.props.showTable = !this.props.showTable;
			if(this.props.showTable)
				React.findDOMNode(this.refs.table_container).style.display = "block";
			else
				React.findDOMNode(this.refs.table_container).style.display = "none";*/
			this.refs.table_container.toggleDisplay();
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

	        preColArr = preColArr.filter(function (elem) {
	        	return !isNaN(elem);
	        });

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

		else if(buttonType === "stats") {
			console.log(functionName + "&&" + propertyName);
			var hot = this.props.table;
			var stats_table = this.props.stats_table;
			// Most ghetto code I've ever written
			var variables = functionName;
			var functions = propertyName;
			var table_data = [];
			variables.unshift("Functions");


			this.refs.stats_table.setHeaders(variables);
			this.refs.stats_table.toggleDisplay();

			var columns = [];
			variables.forEach(function (vars) {
				columns.push(getIndex(hot, vars));
			});

			columns = columns.filter(function(elem) {
				return elem !== undefined;
			});

			for(var i = 0; i < functions.length; i++) {
				stats_table.setDataAtCell(i, 0, functions[i]);
			}

			functions.forEach(function (fn, f_ind) {
				var row = [];
				row.push(fn);
				columns.forEach(function (column, c_ind) {

					var preColArr = hot.getDataAtCol(column).map(function (elem) {
	        			return parseInt(elem);
	        		});

	        		preColArr = preColArr.filter(function (elem) {
			        	return !isNaN(elem);
			        });

			        console.log(preColArr);

			        preColArr = new Column(fn, preColArr);
	        		var out = preColArr.getProperty();
	        		//stats_table.setDataAtCell(f_ind, c_ind + 1, out);
	        		row.push(out);
				});
				table_data.push(row);
			});
			// do this for automatic resizing
			stats_table.loadData(table_data);
		}

		// plot
		else {
			this.setProps({plot: true});
			this.setProps({plot_type: plotType})
			//this.forceUpdate();
		}

	},

	render: function() {
		return (
			<div>
				<MyBar onClick={this.handleClick} variables={this.state.variables} />
	        	<div>
		        	<ChoicePanel choices={this.state.data} axis="x" />
		        	<ChoicePanel choices={this.state.data} axis="y" />
		        	<div id="plot-panel">
		        		<PlotWindow path={this.state.path} />
		        	</div>
		        	<HTable ref="table_container" table={this.props.table} />
		        	<HTable ref="stats_table" table={this.props.stats_table} />
		        	<ModificationPanel onClick={this.handleClick} ref="panel" />
	        	</div>
	        </div>
    	);
	},
});

React.render(<WholeThing />, document.body);

