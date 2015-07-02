function makePlot(obj, props) {
	// read.csv
	ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	// plot
	if(obj) {
		var hot = obj.props.data_table;
		var type = obj.props.plot_type;
		var props = obj.props;
		var dataJSON = JSON.stringify(hot.getData());
	}
	else {
		var dataJSON = JSON.stringify(props.data);
		var type = props.type;
	}
	/*	
	 *	Testing NVD3
	 */

	var nvdata = [{key: "Data", values: JSON.parse(dataJSON)}];
	console.log(dataJSON);

	if(type === "lineChart" || type === "scatterChart")
		plotStandard(dataJSON, type, props.var_x, props.var_y, props.var_g);

	else
		plotBox(dataJSON, type, props.var_g, props.var_x);

	/*
	 *	Done testing
	 */

}

/*
 *  NVD3 data format:
 *     [{key: "group_name", values: [group_elements]}, ...]
 */
function buildData(array, group) {

    if(!group) {
        return [{key: "Data", values: JSON.parse(array)}];
    }

    var data = JSON.parse(array);
    var out = [];
    var obj = {}
    data.forEach(function (d) {
        (obj[d[group]] = obj[d[group]] ? obj[d[group]] : []).push(d);
    });

    console.log(obj);

    Object.keys(obj).forEach(function (o) {
        if(o != "null") {
            temp = {key: o, values: obj[o]};
            out.push(temp);
        }
    });

    return out;
}


function plotStandard(data, type, var_x, var_y, var_g) {
	var myData = buildData(data, var_g);
    console.log(myData);

	d3.selectAll("svg > *").remove();

 	nv.addGraph(function() {

	  var chart = nv.models[type]()
	      .x(function(d) { return d[var_x] })    //Specify the data accessors.
	      .y(function(d) { return d[var_y] })
	      ;

	  d3.select('#plot-panel')
	      .datum(myData)
	      .call(chart);

	  nv.utils.windowResize(chart.update);

	  return chart;
	}.bind(this));
}

function realBox(myData) {

	console.log(myData);

	d3.selectAll("svg > *").remove();

	nv.addGraph(function() {

		var chart = nv.models.boxPlotChart()
		.x(function(d) { return d.label })    //Specify the data accessors.
		.y(function(d) { return d.values.Q3 })
		.maxBoxWidth(75)
		.staggerLabels(true)
		;

		d3.select('#plot-panel')
		.datum(myData)
		.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});

}

function plotBox(data, type, var_x, var_y) {
	ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

	process = [], keys = [];
	var myData = [];

	data = JSON.parse(data);
	categories = _.uniq(data.map(function (d) {
		return d[var_x]
	}));

	categories.forEach(function (x) {
		now = data.filter(function(d) {
			return d[var_x] === x;
		}).map(function(y) {
			return y[var_y]
		});

		if(now[0] !== null)
			process.push({label: x, values: now});
	});

	console.log(process);
	_.initial(process).forEach(function (p) {
		ocpu.call("quantile", {
			x: p.values
		}, function (session) {
			session.getObject(function(out) {
				d = {
					Q1: out[1],
					Q2: out[2],
					Q3: out[3],
					whisker_low: out[0],
					whisker_high: out[4],
					outliers: []
				};
				p.values = d;
				console.log(p);
				myData.push(p);
				console.log(myData);
			});
		});
	});

	var last = _.last(process);

	ocpu.call("quantile", {
		x: last.values
	}, function (session) {
		session.getObject(function(out) {
			d = {
				Q1: out[1],
				Q2: out[2],
				Q3: out[3],
				whisker_low: out[0],
				whisker_high: out[4],
				outliers: []
			};
			last.values = d;
			myData.push(last);
			console.log(myData);
			console.log("Finished!");

			realBox(myData);
		});
	});
}

