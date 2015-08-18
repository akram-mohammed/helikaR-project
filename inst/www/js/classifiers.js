function naiveBayesClassify(bundle) {

	console.log(bundle);
	ocpu.seturl("//public.opencpu.org/ocpu/library/utils/R");

	ocpu.call("read.csv", {
		file: bundle.file
	}, function (session) {
		session.getObject(function (out) {
			console.log(out);

			var train = bundle.table.getData();
			var classify_var = bundle.classify_var;

			var train_y = train.map(function (d) {
				return d[classify_var];
			});

			var train_x = train;

			train_x.forEach(function (f) {
				delete f[classify_var];
			});

			console.log(JSON.stringify(train_x));
			console.log(JSON.stringify(train_y));

			ocpu.seturl("/ocpu/library/Helikar/R");

			ocpu.call("classify", {
				tr_x: train_x,
				tr_y: train_y,
				ip:   out
			}, function (session) {
				session.getObject(function (obj) {
					console.log(obj);
				});

				session.getConsole(function (outtxt) {
					console.log(outtxt);
				});
			});
		});
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

function evaluate(bundle, bar_ref) {
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

	console.log(JSON.stringify(train_x));
	console.log(JSON.stringify(train_y));
	console.log(JSON.stringify(test_x));
	console.log(JSON.stringify(test_y));

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
			bar_ref.setText("classify_modal", "Precision: " + obj[0].precision + "; recall: " + obj[0].recall + "; F-score: " + obj[0].f_score);
		});
		session.getConsole(function (outtxt) {
			console.log(outtxt);
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