var MyBar = React.createClass(
{
	setText: function (modal, text) {
		this.refs[modal].setText(text);
	},

	handleClick: function() {
		var file = React.findDOMNode(this.refs.file);
		file.click();
		$(file).change(function() {
			this.props.onClick("submit");
		}.bind(this));
	},

	saveClick: function() {
		this.props.onClick('save');
	},

	tableClick: function() {
		this.props.onClick("show-table");
	},

	lineClick: function() {
		this.props.onClick("show-feature");
	},

	plotClick: function(plotType, child, var_x, var_y, var_g, x_name, y_name) {
		this.props.onClick("plot", plotType, var_x, var_y, var_g, x_name, y_name);
	},

	uniClick: function(child, variables, functions) {
		this.props.onClick("stats", variables, functions);
	},

	biClick: function(child, var_x, var_y, functions) {
		this.props.onClick("bivariate", var_x, var_y, functions);
	},

	testClick: function(child, var_x, var_y, functions) {
		this.props.onClick("tests", var_x, var_y, functions);
	},

	anovaClick: function(child, vars, functions) {
		this.props.onClick("anova", vars, functions);
	},

	multiPlotClick: function(child, count, args) {
		this.props.onClick("multi", count, args);
	},

	clusterClick: function(clusterType, child, var_x, var_y, clusters) {
		this.props.onClick("cluster", clusterType, var_x, var_y, clusters);
	},

	densityClusterClick: function(clusterType, child, var_x, var_y, minpts, eps) {
		this.props.onClick("cluster", clusterType, var_x, var_y, minpts, eps);
	},

	// TODO: combine into one

	classifyClick: function(child, vars, file, evaluate, ratio) {
		this.props.onClick("classify", vars, file, evaluate, ratio, "naiveBayes");
	},

	SVMClick: function(child, vars, file, evaluate, ratio) {
		this.props.onClick("classify", vars, file, evaluate, ratio, "svm");
	},

	render: function() {
		return (
			<Navbar>
				<Nav>
					<DropdownButton title="File">
						<MenuItem onClick={this.handleClick}>Open</MenuItem>
						<FileField ref="file"/>
						<MenuItem onClick={this.saveClick}>Export image</MenuItem>
					</DropdownButton>
					<DropdownButton title="View">
						<MenuItem onClick={this.tableClick}>Data table</MenuItem>
					</DropdownButton>
					<DropdownButton title="Plot">

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "lineChart")} variables={this.props.variables}  />}>
							<MenuItem>Line</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "scatterChart")} variables={this.props.variables}  />}>
							<MenuItem>Scatter</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "regression")} variables={this.props.variables}  />}>
							<MenuItem>Regression</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "discreteBarChart")} variables={this.props.variables}  />}>
							<MenuItem>Bar</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<BoxPlotModal onClick={this.plotClick.bind(this, "boxChart")} variables={this.props.variables}  />}>
							<MenuItem>Box</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<BoxPlotModal onClick={this.plotClick.bind(this, "quadreg")} variables={this.props.variables}  />}>
							<MenuItem>Quadratic</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<HistModal onClick={this.plotClick.bind(this, "histogram")} variables={this.props.variables}  />}>
							<MenuItem>Histogram</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<DCModal onClick={this.multiPlotClick} variables={this.props.variables} />}>
							<MenuItem>Multiplot</MenuItem>
						</ModalTrigger>

					</DropdownButton>


					<DropdownButton title="Analyses">

						<ModalTrigger modal={<ChoiceModal onClick={this.uniClick} variables={this.props.variables} />}>
							<MenuItem>Univariate</MenuItem>
						</ModalTrigger>
						
						<ModalTrigger modal={<BivariateModal onClick={this.biClick} variables={this.props.variables} />}>
							<MenuItem>Bivariate</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<TestsModal onClick={this.testClick} variables={this.props.variables} />}>
							<MenuItem>t-tests</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<AnovaModal onClick={this.anovaClick} variables={this.props.variables} />}>
							<MenuItem>ANOVA</MenuItem>
						</ModalTrigger>

					</DropdownButton>

					<DropdownButton title="Clustering">

						<ModalTrigger modal={<ClusterModal onClick={this.clusterClick.bind(this, "kmeans")} variables={this.props.variables} />}>
							<MenuItem>K-means</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<ClusterModal onClick={this.clusterClick.bind(this, "hierarchical")} variables={this.props.variables} />}>
							<MenuItem>Hierarchical</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<DensityClusterModal onClick={this.densityClusterClick.bind(this, "density")} variables={this.props.variables} />}>
							<MenuItem>Density-based (DBSCAN)</MenuItem>
						</ModalTrigger>
						
					</DropdownButton>

					<DropdownButton title="Classification">

						<ModalTrigger modal={<ClassifyModal ref="naiveBayes_modal" onClick={this.classifyClick} variables={this.props.variables} />}>
							<MenuItem>Naive Bayes</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<ClassifyModal ref="svm_modal" onClick={this.SVMClick} variables={this.props.variables} />}>
							<MenuItem>SVM</MenuItem>
						</ModalTrigger>

					</DropdownButton>

				</Nav>
			</Navbar>
		);
	},
});