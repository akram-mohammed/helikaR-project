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

	var train_y = train.map(function (d) {
		return d[classify_var];
	})

	var test_y = test.map(function (d) {
		return d[classify_var];
	})

	var train_x = train;
	var test_x = test;

	train_x.forEach(function (f) {
		delete f[classify_var];
	});

	test_x.forEach(function (f) {
		delete f[classify_var];
	});

	//var test_x = test;


	console.log(JSON.stringify(train_x));
	console.log(JSON.stringify(train_y));

	var x, y;

	/*ocpu.seturl("//public.opencpu.org/ocpu/library/e1071/R");
	ocpu.call("naiveBayes", {
		// TODO: filter out null
		x: train_x,
		y: train_y
	}, function (session1) {

		// START

		ocpu.seturl("//public.opencpu.org/ocpu/library/stats/R");
		ocpu.call("predict", {
			object: session1,
			newdata: test_x
		}, function (session2) {
			session2.getObject(null, {force: true}, function (obj) {
				console.log(obj);
			});
		});

		// END
	});
	*/

	/*ocpu.seturl("//public.opencpu.org/ocpu/library/base/R");
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
					x: x[0],
					y: y[0]
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

	});*/

}

function evaluate(bundle) {
	console.log("Shan't!");

	var data = bundle.table.getData();
	shuffle(data);
	var test_index = Math.floor(data.length * 7 / 10);

	var classify_var = bundle.classify_var;
	
	var train = data.slice(0, test_index);
	var test = data.slice(test_index);

	var train_y = train.map(function (d) {
		return d[classify_var];
	})

	var test_y = test.map(function (d) {
		return d[classify_var];
	})

	var train_x = train;
	var test_x = test;

	train_x.forEach(function (f) {
		delete f[classify_var];
	});

	test_x.forEach(function (f) {
		delete f[classify_var];
	});

	ocpu.seturl("/ocpu/library/Helikar/R");
	console.log("set");

	ocpu.call("myfn", {
		tr_x: train_x,
		tr_y: train_y,
		te_x: test_x,
		te_y: test_y
	}, function (session) {
		session.getObject(function (obj) {
			console.log(obj);
		})
	});

	/*ocpu.seturl("//localhost/ocpu/library/e1071/R");
	ocpu.call("naiveBayes", {
		// TODO: filter out null
		x: train_x,
		y: train_y
	}, function (session1) {

		// START

		ocpu.call("predict", {
			object: session1,
			newdata: test_x
		}, function (session2) {
			session2.getObject(null, {force: true}, function (obj) {
				console.log(obj);
			});
		});



		
		// END

	});*/

}

function shuffle(sourceArray) {
    for (var n = 0; n < sourceArray.length - 1; n++) {
        var k = n + Math.floor(Math.random() * (sourceArray.length - n));

        var temp = sourceArray[k];
        sourceArray[k] = sourceArray[n];
        sourceArray[n] = temp;
    }
}