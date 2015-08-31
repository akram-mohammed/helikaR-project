/*
 *	The entire interface
 */

var WholeThing = React.createClass(
{
	getInitialState: function() {
		return {file: "", data: [], path: "", variables: [], cluster: false, plot_type: ""};
	},

	getDefaultProps: function() {
		return {data_table: null, plot: false, showTable: false, multi: true, plot_count: 4, plot_type: ""};
	},

	componentDidMount: function() {

		var container, table;

		// Data table
		container = React.findDOMNode(this.refs.data_ref);
	    table = new Handsontable(container, {
	        colHeaders: true,
	        minSpareRows: 1,
	        contextMenu: true,
	        stretchH: "all",
	        manualColumnResize: true,
	        height: 500
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
			startCols: 2,
			manualColumnResize: true,
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
			startCols: 2,
			manualColumnResize: true
		});

		this.setProps({bi_table: table});
		this.refs.bi_ref.displayOff();

		// Tests table
		container = React.findDOMNode(this.refs.test_ref);
		table = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 2,
			manualColumnResize: true
		});

		this.setProps({test_table: table});
		this.refs.test_ref.displayOff();

		// ANOVA table
		container = React.findDOMNode(this.refs.anova_ref);
		table = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 2,
			manualColumnResize: true
		});

		this.setProps({anova_table: table});
		this.refs.anova_ref.displayOff();

		// Classify table
		container = React.findDOMNode(this.refs.classify_ref);
		table = new Handsontable(container, {
			colHeaders: true,
			minSpareRows: 0,
			contextMenu: false,
			stretchH: "all",
			startCols: 2,
			manualColumnResize: true
		});

		this.setProps({classify_table: table});
		this.refs.classify_ref.displayOff();
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
	        	"file": this.state.file,
	        	"check.names": new ocpu.Snippet("FALSE")
	        }, function (session) {

	        	session.getObject(function (out) {

	        		var headers = Object.keys(out[0]);
	        		this.setState({variables: headers});
	       
                	this.refs.data_ref.setHeaders(headers);
                	console.log(out);
                	this.refs.data_ref.displayOn();
                	this.refs.data_ref.setData(out);

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
	    if(this.props.plot) {

	    	makePlot(this);	
	        this.setProps({plot: false});

	    }

	    if(this.state.cluster) {
	    	// clusters and minpts are the same
	    	var bundle = {clusters: this.state.clusters, eps: this.state.eps, table: this.props.data_table, vars: {x: this.state.var_x, y: this.state.var_y}};

	    	if(this.state.cluster_type === "kmeans")
	    		kmeansCluster(bundle);

	    	else if(this.state.cluster_type === "hierarchical")
	    		hierarchicalCluster(bundle);

	    	else
	    		densityCluster(bundle);
		
			this.setState({cluster: false});
	    }

	    if(this.state.classify) {
	    	console.log(this.state.classify_var);

	    	var bundle = {classify_var: this.state.classify_var, table: this.props.data_table, file: this.state.classify_file, ratio: this.state.classify_ratio, classify_type: this.state.classify_type};
	    	//naiveBayesClassify(bundle);
	    	if(this.state.classify_eval)
		    	evaluate(bundle, this.refs.top_bar);
		    else {
		    	naiveBayesClassify(bundle, this.refs.classify_ref);
		    }

	    	//this.refs.top_bar.getModal("tref"));
	    }
	},

	// ugly function thing
	// TODO - replace params with arguments array
	handleClick: function(buttonType, functionName, propertyName, plotType) {

		// map function names to actual names
		fn_names = {
			"mean": "Mean",
			"median": "Median",
			"sd": "Standard Deviation",
			"variance": "Variance",
			"skewness": "Skewness",
			"kurtosis": "Kurtosis",
			"cov": "Covariance",
			"cor": "Correlation"
		}

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
					uni_table.setDataAtCell(i, 0, fn_names[functions[i]]);
				}

				functions.forEach(function (fn, f_ind) {
					var row = [];
					row.push(fn);
					columns.forEach(function (column, c_ind) {

						var preColArr = getSanitizedData(table, column);

				        console.log(preColArr);

				        preColArr = new Column(preColArr);
		        		var out = preColArr.getProperty(fn);
		        		uni_table.setDataAtCell(f_ind, c_ind + 1, out);
					});
					table_data.push(row);
				});

				// do this for automatic resizing
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

				this.refs.bi_ref.setHeaders(["Function", label_2 + " ~ " + label_1]);
				this.refs.bi_ref.displayOn();

				// TODO: use state
				ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

	        	functions.forEach(function (fn, n) {
	        		var row = [fn];

					var statsRequest = ocpu.call(fn, {
						"x": col_1,
						"y": col_2
					}, function (session) {
						session.getObject(null, {force: true}, function (out) {
							console.log(out);

							if(fn === "t.test") 
								d = "t: " + out.statistic[0] + "\np: " + out["p.value"][0];
							else 
								d = out;
							bi_table.spliceRow(n, 0, 0, fn_names[fn], d);

						});
					});

					data.push(row);
	        	});

//	        	bi_table.loadData(data);

				break;

			/*
			 *	t-tests
			 */

			case "tests":
				var table = this.props.data_table;
				var test_table = this.props.test_table;

				var data = [];

				var label_1 = arguments[1], label_2 = arguments[2], functions = arguments[3];
				var col_1 = getSanitizedData(table, getIndex(table, label_1)), col_2 = getSanitizedData(table, getIndex(table, label_2));

				this.refs.test_ref.setHeaders(["Test", label2 + " ~ " + label1]);
				this.refs.test_ref.displayOn();

				// TODO: use state
				ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

				functions.forEach(function (fn, n) {
					var paired = false; 
					var student = false;
					var row = [fn];

					if(fn === "paired")
						paired = true;

					if(fn === "student")
						student = true;

					var statsRequest = ocpu.call("t.test", {
						"x": col_1,
						"y": col_2,
						"paired": paired,
						"var.equal": student
					}, function (session) {
						session.getObject(null, {force: true}, function (out) {
							d = "t: " + out.statistic[0] + "\np-value: " + out["p.value"][0];
							test_table.spliceRow(n, 0, 0, out["method"][0], d);
						});
					});

					data.push(row);
					console.log(data);
				});

				break;

			/*
			 *	ANOVA
			 */

			case "anova":
				var table = this.props.data_table;
				var anova_table = this.props.anova_table;

				var for_table = [];
				var data = [];
				var cols = [];
				var groups = [], values = [];
				var title_string = "";
				var labels = arguments[1], functions = arguments[2];


				labels.forEach(function (l, index) {
					title_string = title_string.concat(index ===0 ? l : (", " + l));
					var col = getSanitizedData(table, getIndex(table, l));
					for(var i = 0; i < col.length; i++)
					{
						groups.push(l);
						values.push(col[i]);
						data.push([col[i], l]);
					}
				});

				this.refs.anova_ref.setHeaders(["Test", title_string]);
				this.refs.anova_ref.displayOn();

				//data.push(groups);
				//data.push(values);
				console.log(JSON.stringify(groups));
				console.log(JSON.stringify(values));

				ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

				ocpu.call("lm", {
					//"data": new ocpu.Snippet("jsonlite::fromJSON('" + JSON.stringify(data) + "')")
					"data": new ocpu.Snippet("data.frame(label = jsonlite::fromJSON('" + JSON.stringify(values) + "'), value = jsonlite::fromJSON('" + JSON.stringify(groups) + "'))")
				}, function (session) {
					
					// BEGIN
		        	functions.forEach(function (fn, n) {
		        		var row = [fn];

						var statsRequest = ocpu.call(fn, {
							object: session
						}, function (session) {
							session.getObject(null, {force: true}, function (out) {
								d = "F-value: " + out[0]["F value"] + "\np: " + out[0]["Pr(>F)"];
								anova_table.spliceRow(n, 0, 0, fn, d);
							});
						});

						data.push(row);
						console.log(for_table);
		        	});
		        	// END

				});


				break;


			/*
			 *	Multigraph
			 */

			case "multi":
				count = arguments[1];
				console.log(count);
				this.setProps({plot_count: count, multi: true});
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
						.width(640)
						.height(480)
						.x(d3.scale.linear().domain([bot, top]))
						.elasticX(true)
						.xAxisPadding("5%")
						.brushOn(true)
						.dimension(weightDimension)
						.group(weightGroup)
				        .transitionDuration(500)
				        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb']);

				    count++;
		        }

		        // Bubble is true, build plot
		        if(values.bubble) {
		        	console.log(count);
					var bubbleChart = dc.bubbleChart("#box_" + count);
					
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

			    dc.renderAll();
			    dc.redrawAll();

				break;

			/*
			 *	Save graph as SVG
			 *	TODO: add modal with format and path support
			 */

			case "save":
				console.log("Save!!");

			 	$.getScript("js/libs/svg-crowbar.js", function() {
			 		console.log("Script!!");
			 	});
				break;

			/*
			 *	Clustering
			 */

			case "cluster":
				this.setState({cluster: true, cluster_type: arguments[1], var_x: arguments[2], var_y: arguments[3], clusters: arguments[4], eps: arguments[5] || 0});
				break;

			/*
			 *	Classification
			 */

			case "classify":
				console.log(arguments[2]);
				this.setState({classify: true, classify_var: arguments[1], classify_file: arguments[2], classify_eval: arguments[3], classify_ratio: arguments[4], classify_type: arguments[5]});
				break;

			/*
			 *	Plot graph
			 */

			default:
				var plot_type = arguments[1], var_x = arguments[2], var_y = arguments[3], var_g = arguments[4], x_name = arguments[5], y_name = arguments[6];
				this.setProps({multi: false, plot: true});
				this.setProps({plot_type: plot_type, var_x: var_x, var_y: var_y, var_g: var_g, reg: false, x_name: x_name, y_name: y_name});
		}

	},


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
				<MyBar ref="top_bar" onClick={this.handleClick} variables={this.state.variables} plotEnabled={this.props.plot_type} />
	        	<div>
	        		{thing}
	        		<div id="temp_plot_thing"></div>
		        	<HTable ref="uni_ref" table={this.props.uni_table} table_id={2} />
		        	<HTable ref="bi_ref" table={this.props.bi_table} table_id={3} />
		        	<HTable ref="test_ref" table={this.props.test_table} table_id={4} />
		        	<HTable ref="anova_ref" table={this.props.anova_table} table_id={5} />
		       		<HTable ref="classify_ref" table={this.props.classify_table} table_id={6} />
		       		<HTable ref="data_ref" table={this.props.data_table} table_id={1} />
	        	</div>
	        </div>
    	);
	}
});