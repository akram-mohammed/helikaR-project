function kmeansCluster(bundle) {
	var clusters = parseInt(bundle.clusters);
	var hot = bundle.table;
	var var_x = bundle.vars.x, var_y = bundle.vars.y;

	ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");
	var frame = new ocpu.Snippet("head(data.frame(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')), -1)");
	
	ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");
	var req = ocpu.call("kmeans", {
		x: frame,
		centers: clusters
	}, function(session) {
		session.getObject(null, {force: true}, function (obj) {
			ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");
			ocpu.call("identity", {
				//x: new ocpu.Snippet("data.frame(cluster=jsonlite::fromJSON('" + JSON.stringify(obj) + "')$cluster)")
				x: new ocpu.Snippet("data.frame(na.omit(jsonlite::fromJSON('" + JSON.stringify(hot.getData()) + "')),cluster=jsonlite::fromJSON('" + JSON.stringify(obj) + "')$cluster)")
			}, function(session2) {
				session2.getObject(function (obj2) {
					makePlot(null, {type: "scatterChart", data: obj2, var_x: var_x, var_y: var_y, var_g: "cluster"});
				});
			});
			console.log(obj);
		});
	});
}

function hierarchicalCluster(bundle) {

	var table = bundle.table;
	var var_x = bundle.vars.x, var_y = bundle.vars.y;


	
	ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");

	ocpu.call("hclust", {
		d: new ocpu.Snippet("dist(head(data.frame(jsonlite::fromJSON('" + JSON.stringify(table.getData()) + "')), -1))")
	}, function (session) {
		session.getObject(null, {force: true}, function (obj) {
			console.log(obj.labels);

			ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");

			var HCtoJSON = new ocpu.Snippet (
				"\
				labels <- jsonlite::fromJSON('" + JSON.stringify(obj.labels) + "') \
				merge  <- data.frame(jsonlite::fromJSON('" + JSON.stringify(obj.merge) + "')) \
		  		\
				"
			);

			ocpu.call("identity", {
				x: HCtoJSON
			});
		});
	});


}