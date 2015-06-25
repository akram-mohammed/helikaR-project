var MyBar = React.createClass(
{
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

	tableClick: function(buttonType) {
		this.props.onClick("show-table");
	},

	plotClick: function(plotType, child, var_x, var_y, var_g) {
		this.props.onClick("plot", plotType, var_x, var_y, var_g);
	},

	uniClick: function(child, variables, functions) {
		this.props.onClick("stats", variables, functions);
	},

	biClick: function(child, var_x, var_y, functions) {
		this.props.onClick("bivariate", var_x, var_y, functions);
	},

	multiPlotClick: function(child, count, args) {
		this.props.onClick("multi", count, args);
	},

	render: function() {
		return (
			<Navbar>
				<Nav>
					<DropdownButton title="File">
						<MenuItem onClick={this.handleClick}>Open</MenuItem>
						<FileField ref="file"/>
						<MenuItem onClick={this.saveClick}>Save</MenuItem>
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

						<ModalTrigger modal={<DCModal onClick={this.multiPlotClick} variables={this.props.variables} />}>
							<MenuItem>Multi</MenuItem>
						</ModalTrigger>

					</DropdownButton>


					<DropdownButton title="Functions">

						<ModalTrigger modal={<ChoiceModal onClick={this.uniClick} variables={this.props.variables} />}>
							<MenuItem>Univariate</MenuItem>
						</ModalTrigger>
						
						<ModalTrigger modal={<BivariateModal onClick={this.biClick} variables={this.props.variables} />}>
							<MenuItem>Bivariate</MenuItem>
						</ModalTrigger>


					</DropdownButton>
				</Nav>
			</Navbar>
		);
	},
});