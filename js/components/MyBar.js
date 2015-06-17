var MyBar = React.createClass(
{
	handleClick: function() {
		var file = React.findDOMNode(this.refs.file);
		file.click();
		$(file).change(function() {
			this.props.onClick("submit");
		}.bind(this));
		
	},

	tableClick: function(buttonType) {
		this.props.onClick("show-table");
	},

	plotClick: function(plotType, child, var_x, var_y, var_g, is_g) {
		console.log(is_g);
		this.props.onClick("plot", plotType, var_x, var_y, var_g, is_g);
	},

	uniClick: function(child, variables, functions) {
		this.props.onClick("stats", variables, functions);
	},

	biClick: function(child, var_x, var_y, functions) {
		this.props.onClick("bivariate", var_x, var_y, functions);
	},

	render: function() {
		return (
			<Navbar>
				<Nav>
					<DropdownButton title="File">
						<MenuItem onClick={this.handleClick}>Open</MenuItem>
						<FileField ref="file"/>
					</DropdownButton>
					<DropdownButton title="View">
						<MenuItem onClick={this.tableClick}>Data table</MenuItem>
					</DropdownButton>
					<DropdownButton title="Plot">

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "lineChart")} variables={this.props.variables}  />}>
							<MenuItem>Line</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "scatterChart")} variables={this.props.variables}  />}>
							<MenuItem>Line</MenuItem>
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