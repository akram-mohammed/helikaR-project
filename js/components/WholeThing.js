/*
 *	The entire interface
 */

var WholeThing = React.createClass(
{
	getInitialState: function() {
		return {file: "", data: [], path: "", variables: []};
	},

	getDefaultProps: function() {
		return {data_table: null, plot: false, showTable: false, multi: true, plot_count: 4};
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

	        	/*	
		         *	Testing NVD3
		         */

		        var dataJSON = JSON.stringify(hot.getData());
		        var nvdata = [{key: "Data", values: JSON.parse(dataJSON)}];
		        var props = this.props;

		        var myData = buildData(dataJSON, props.var_g);
		        console.log(buildData(dataJSON, props.var_g));
				console.log(nvdata);
				//console.log([{key: "Shit", values: JSON.parse(dataJSON)}]);

		     	nv.addGraph(function() {

				  var chart = nv.models.lineChart()
				      .x(function(d) { return d[props.var_x] })    //Specify the data accessors.
				      .y(function(d) { return d[props.var_y] })
				      ;

				  d3.select('#plot-panel')
				      .datum(myData)
				      .call(chart);

				  nv.utils.windowResize(chart.update);

				  return chart;
				}.bind(this));


		        /*
		         *	Done testing
		         */


	        	/* OLD RCHARTS STUFF
	        	session.getObject(function () {

	        		var requestText;
	        		console.log(this.props.group);

		            if(this.props.group)
		            	requestText = "nPlot(" + this.props.var_y + " ~ " + this.props.var_x + ", group = '" + this.props.var_g + "', data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = '" + this.props.plot_type + "')\n";
		            else
		            	requestText = "nPlot(" + this.props.var_y + " ~ " + this.props.var_x + ", data = data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), type = '" + this.props.plot_type + "')\n";		            	


	            	// make_chart
		            ocpu.seturl("//ramnathv.ocpu.io/rCharts/R");

		            var plotRequest = ocpu.call("make_chart", {
		            	text: requestText
	            	}, function(session2) {

	            		session2.getConsole(function (code) {
	            			var url = session2.getLoc() + "files/output.html";
	            			ocpu.call("take_screenshot", {
	            				src: code,
	            				imgname: "/home/vinit/img_r.jpg"
	            			}, function (session3) {
	            				session3.getObject(function (obj) {
	            					console.log(obj);
	            				});
	            				console.log("Clicked!");
	            			});
	            			this.setState({path: url});
	            		}.bind(this));
	            	}.bind(this));
	        	}.bind(this));*/
	        }.bind(this));



	        this.setProps({plot: false});
	    }
	},

	// ugly function thing
	// TODO - replace params with arguments array
	handleClick: function(buttonType, functionName, propertyName, plotType) {

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

				var variables = arguments[1], functions = arguments[2];

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

				var label_1 = arguments[1], label_2 = arguments[2], functions = arguments[3];
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
	        	});

	        	bi_table.loadData(data);

				break;

			/*
			 *	Multigraph
			 */

			case "multi":
				count = arguments[1];
				console.log(count);
				this.setProps({plot_count: count});
				// DC stuff
				values = arguments[2];
				var bar_x 		 = values.bar_vars.x;
				var bar_y 		 = values.bar_vars.y;
				var bubble_x	 = values.bubble_vars.x;
				var bubble_y	 = values.bubble_vars.y;
				var bubble_g	 = values.bubble_vars.g;

				var table = this.props.data_table;

		        var dataJSON = JSON.stringify(table.getData());

		        var dataCSV = Papa.unparse(dataJSON);

		        var count = 0;

		        // Data
		        var data = d3.csv.parse(dataCSV);
				var ndx = crossfilter(data);
				console.log(values);			

		        // Bar is true, build plot
		        if(values.bar) {
					var barChart = dc.barChart("#box_" + count);

					var weightDimension = ndx.dimension(function (d) {
						return d[bar_x];
					});
					var weightGroup = weightDimension.group().reduceSum(function (x) { return x[bar_y] });

					var top = weightDimension.top(1)[0][bar_x];
					var bot = weightDimension.bottom(1)[0][bar_x];
					barChart
						.width(320)
						.height(240)
						.x(d3.scale.linear().domain([bot, top]))
						.elasticX(true)
						.xAxisPadding("5%")
						.brushOn(true)
						.dimension(weightDimension)
						.group(weightGroup)
				        .transitionDuration(500)
				        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb']);

				    barChart.render();
		        }

		        // Bubble is true, build plot
		        if(values.bubble) {
					var bubbleChart = dc.bubbleChart("#second_dc");
					
					var peopleDimension = ndx.dimension(function (d) {
						return d[bubble_g];
					});

					var peopleGroup = peopleDimension.group().reduce(
						function (p, v) {
							p.totY += +v[bubble_y];
							p.totX += +v[bubble_x];
							return p;
						},
						function (p, v) {
							--p.count;
							p.totY -= +v[bubble_y];
							p.totX -= +v[bubble_x];
							return p;
						},
						function() {
							return { totY: 0, totX: 0 }
						}
					);

					bubbleChart
						.width(640)
						.height(480)
						.margins({top: 10, right: 50, bottom: 30, left: 60})
						.dimension(peopleDimension)
						.group(peopleGroup)
						.colors(d3.scale.category10())
						.keyAccessor(function (d) {
							return d.value.totY;
						})
						.valueAccessor(function (d) {
							return d.value.totX;
						})
						.radiusValueAccessor(function (d) {
							return d.key;
						})
						.maxBubbleRelativeSize(0.3)
						.x(d3.scale.linear().domain([0, 200]))
						.r(d3.scale.linear().domain([0, 100]))
						.yAxisPadding(100)
						.xAxisPadding(100)
						.elasticY(true)
						.elasticX(true);

			    }
				break;

				dc.renderAll();

			/*
			 *	Save graph as SVG
			 *	TODO: add modal with format and path support
			 */

			case "save":
				console.log("Save!!");
				/*var tmp = document.createElement("div");
				tmp.appendChild(this.refs.plot_ref.getDOMNode());
			 	var dataBlob = new Blob([tmp.innerHTML], {
			 		type: 'text/plain'
			 	});
			 	saveAs(dataBlob, "ouput.svg");*/
			 	$.getScript("js/libs/svg-crowbar.js", function() {
			 		console.log("Script!!");
			 	});
				break;

			/*
			 *	Plot graph
			 */

			default:
				var plot_type = arguments[1], var_x = arguments[2], var_y = arguments[3], var_g = arguments[4];
				this.setProps({plot: true});
				this.setProps({plot_type: plot_type, var_x: var_x, var_y: var_y, var_g: var_g});
		}

	},

	/*
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
		        	<div id="first_dc"></div>
		        	<div id="second_dc"></div>
		        	<HTable ref="data_ref" table={this.props.data_table} />
		        	<HTable ref="uni_ref" table={this.props.uni_table} />
		        	<HTable ref="bi_ref" table={this.props.bi_table} />
	        	</div>
	        </div>
    	);
	},
	*/

	render: function() {
		console.log(this.props.multi);
		if(!this.props.multi)
			var thing = <svg id="plot-panel" ref="plot_ref"></svg>;
		else {
			var thing = [];
			for(var i = 0; i < this.props.plot_count; i++)
				thing.push(<div id={"box_" + i}></div>);
		}

		return (
			<div>
				<MyBar onClick={this.handleClick} variables={this.state.variables} />
	        	<div>
	        		{thing}
		        	<HTable ref="data_ref" table={this.props.data_table} />
		        	<HTable ref="uni_ref" table={this.props.uni_table} />
		        	<HTable ref="bi_ref" table={this.props.bi_table} />
	        	</div>
	        </div>
    	);
	}
});