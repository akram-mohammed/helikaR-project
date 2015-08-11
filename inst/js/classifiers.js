function naiveBayesClassify(bundle) {
	var data = bundle.table.getData();
	console.log(data);

	var classify_var = bundle.classify_var;
	
	var train = data.filter(function (d) {
		return d[classify_var] !== "";
	});

	var test = data.filter(function (d) {
		return d[classify_var] === "";
	});

	console.log(JSON.stringify(train));
	
	var x, y;

	ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");
	var xcall = ocpu.rpc("subset", {
		x: new ocpu.Snippet("na.omit(jsonlite::fromJSON('" + JSON.stringify(train) + "'))"),
		select: new ocpu.Snippet("-" + classify_var)
	}, function (output) {
		x = output;

		// START
		var ycall = ocpu.rpc("subset", {
			x: new ocpu.Snippet("na.omit(jsonlite::fromJSON('" + JSON.stringify(train) + "'))"),
			select: new ocpu.Snippet(classify_var)
		}, function (output) {
			y = output;
			
			// START

				ocpu.seturl("//public.opencpu.org/ocpu/library/e1071/R");
				ocpu.call("naiveBayes", {
					x: x,
					y: y
				}, function (session1) {
					
					// START

					ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");
					ocpu.call("predict", {
						object: session1
					}, function (session2) {
						session2.getObject(null, {force: true}, function (obj) {
							console.log(obj);
						});
					});

					// END	

				});

			// END

		});
		// END

	});

}