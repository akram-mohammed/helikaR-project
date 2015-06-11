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

		var container, hot;

		// Data table
		container = React.findDOMNode(this.refs.data_ref);
	    hot = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all"
    	});

		this.setProps({data_table: hot});
		this.refs.data_ref.displayOff();

		// Univariate table
		container = React.findDOMNode(this.refs.stats_table);
		hot = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 5
		});

		this.setProps({stats_table: hot});
		this.refs.stats_table.displayOff();
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

	        	var hot = this.props.data_table;
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
				console.log(functionName + "&&" + propertyName);
				var hot = this.props.data_table;
				var stats_table = this.props.stats_table;
				// Most ghetto code I've ever written
				var variables = functionName;
				var functions = propertyName;
				var table_data = [];
				variables.unshift("Functions");


				this.refs.stats_table.setHeaders(variables);
				this.refs.stats_table.displayOn();

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

						/*var preColArr = hot.getDataAtCol(column).map(function (elem) {
		        			return parseInt(elem);
		        		});

		        		preColArr = preColArr.filter(function (elem) {
				        	return !isNaN(elem);
				        });*/

						var preColArr = getSanitizedData(hot, column);

				        console.log(preColArr);

				        preColArr = new Column(preColArr);
		        		var out = preColArr.getProperty(fn);
		        		//stats_table.setDataAtCell(f_ind, c_ind + 1, out);
		        		row.push(out);
					});
					table_data.push(row);
				});
				// do this for automatic resizing
				stats_table.loadData(table_data);
				break;

			/*
			 *	Bivariate stats
			 */

			case "bivariate":
				console.log(arguments);
				var hot = this.props.data_table;
				var label_1 = arguments[2], label_2 = arguments[3];
				var col_1 = getSanitizedData(hot, getIndex(hot, label_1)), col_2 = getSanitizedData(hot, getIndex(hot, label_2));
				/*var bi_col = new MultiCol(col_1, col_2);
				console.log(bi_col.cov());*/
	        	ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

				var covRequest = ocpu.call("cov", {
					"x": col_1,
					"y": col_2
				}, function (session) {
					session.getObject(function (out) {
						console.log(out);
					});
				});

				break;
			/*
			 *	Plot graph
			 */

			default:
				this.setProps({plot: true});
				this.setProps({plot_type: plotType})
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
		        	<HTable ref="stats_table" table={this.props.stats_table} />
	        	</div>
	        </div>
    	);
	},
});