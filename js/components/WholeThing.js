/*
 *	The entire interface
 */

var WholeThing = React.createClass(
{
	getInitialState: function() {
		return {file: "", data: [], path: "", variables: []};
	},

	getDefaultProps: function() {
		return {data_table: null, plot: false, showTable: false};
	},

	componentDidMount: function() {

		var container, table;

		// Data table
		container = React.findDOMNode(this.refs.data_ref);
	    table = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});

		this.setProps({data_table: table});
		this.refs.data_ref.displayOff();

		// Univariate table
		container = React.findDOMNode(this.refs.uni_ref);
		table = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 2
		});

		this.setProps({uni_table: table});
		this.refs.uni_ref.displayOff();

		// Bivariate table
		container = React.findDOMNode(this.refs.bi_ref);
		table = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 2
		});

		this.setProps({bi_table: table});
		this.refs.bi_ref.displayOff();

	},

	componentDidUpdate: function(prevProps, prevState) {

		/*
		 *	Upload and plot are both including here because both are async calls
		 */

		// State is updated with a new file on clicking upload
		if(this.state.file !== prevState.file)
		{			
			// read.csv
			ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	        // upload
	        var uploadRequest = ocpu.call("read.csv", {
	        	"file": this.state.file
	        }, function (session) {

	        	session.getObject(function (out) {

	        		var headers = Object.keys(out[0]);
	        		this.setState({variables: headers});
	       
                	this.refs.data_ref.setHeaders(headers);
                	this.refs.data_ref.setData(out);


        			/*var container = React.findDOMNode(this.refs.data_ref);
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

					// colnames
	        		ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

	        		var variableRequest = ocpu.call("colnames", {
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

	    // Plot graph
	    if(this.props.plot === true) {

	    	// read.csv
	    	ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	        // plot
	        var readRequest = ocpu.call("read.csv", {
	        	"file": this.state.file
	        }, function (session) {

	        	var hot = this.props.data_table;
	        	var type = this.props.plot_type;

	        	session.getObject(function () {


		            var requestText = "nPlot(" + this.props.var_y + " ~ " + this.props.var_x + ", group = '" + this.props.var_g + "', data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = '" + this.props.plot_type + "')\n";

	            	// make_chart
		            ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");

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

		switch(buttonType) {

			/*
			 *	Load file
			 */

			case "submit":
				var myFile = $("#invis-file")[0].files[0];
				console.log(myFile);
				this.setState({file: myFile});
				break;

			/*
			 *	Toggle table visibility
			 */

			case "show-table":
				this.refs.data_ref.toggleDisplay();
				break;

			/*
			 *	Display descriptive stats table
			 */

			case "stats":
				var table = this.props.data_table;
				var uni_table = this.props.uni_table;

				// Most ghetto code I've ever written
				var variables = functionName;
				var functions = propertyName;
				var table_data = [];
				variables.unshift("Function");

				this.refs.uni_ref.setHeaders(variables);
				this.refs.uni_ref.displayOn();

				var columns = [];
				variables.forEach(function (vars) {
					columns.push(getIndex(table, vars));
				});

				columns = columns.filter(function(elem) {
					return elem !== undefined;
				});

				for(var i = 0; i < functions.length; i++) {
					uni_table.setDataAtCell(i, 0, functions[i]);
				}

				functions.forEach(function (fn, f_ind) {
					var row = [];
					row.push(fn);
					columns.forEach(function (column, c_ind) {

						/*var preColArr = table.getDataAtCol(column).map(function (elem) {
		        			return parseInt(elem);
		        		});

		        		preColArr = preColArr.filter(function (elem) {
				        	return !isNaN(elem);
				        });*/

						var preColArr = getSanitizedData(table, column);

				        console.log(preColArr);

				        preColArr = new Column(preColArr);
		        		var out = preColArr.getProperty(fn);
		        		//uni_table.setDataAtCell(f_ind, c_ind + 1, out);
		        		row.push(out);
					});
					table_data.push(row);
				});
				// do this for automatic resizing
				uni_table.loadData(table_data);
				break;

			/*
			 *	Bivariate stats
			 */

			case "bivariate":
				var table = this.props.data_table;
				var bi_table = this.props.bi_table;

				var data = [];

				var label_1 = arguments[2], label_2 = arguments[3], functions = arguments[4];
				console.log(functions);
				var col_1 = getSanitizedData(table, getIndex(table, label_1)), col_2 = getSanitizedData(table, getIndex(table, label_2));

				this.refs.bi_ref.setHeaders(["Function", "Value"]);
				this.refs.bi_ref.displayOn();

	        	ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

	        	functions.forEach(function (fn) {
	        		var row = [fn];
					var statsRequest = ocpu.call(fn, {
						"x": col_1,
						"y": col_2
					}, function (session) {
						session.getObject(function (out) {
							row.push(out);
						});
					});

					data.push(row);
	        	})

	        	bi_table.loadData(data);

				break;

			/*
			 *	Plot graph
			 */

			default:
				var plotType = arguments[0], var_x = arguments[1], var_y = arguments[2], var_g = arguments[3];
				this.setProps({plot: true});
				this.setProps({plot_type: plotType, var_x: var_x, var_y: var_y, var_g: var_g});
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
		        	<HTable ref="data_ref" table={this.props.data_table} />
		        	<HTable ref="uni_ref" table={this.props.uni_table} />
		        	<HTable ref="bi_ref" table={this.props.bi_table} />
	        	</div>
	        </div>
    	);
	},
});