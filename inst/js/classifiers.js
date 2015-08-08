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
	
	ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");
	ocpu.call("subset", {
		x: new ocpu.Snippet("na.omit(jsonlite::fromJSON('" + JSON.stringify(train) + "'))"),
		select: new ocpu.Snippet("-" + classify_var)
	}, function (session) {
		session.getObject(null, {force: true}, function (obj) {
			console.log(obj);
		});
	})
}