var MyBar = React.createClass(
{
	handleClick: function(buttonType, plotType) {
		if(buttonType == "submit") {
			var file = React.findDOMNode(this.refs.file);
			file.click();
			$(file).change(function() {
				this.props.onClick(this, buttonType);
			}.bind(this));
		}

		else {
			this.props.onClick(this, buttonType, null, null, plotType);
		}

	},

	plotClick: function(plotType, child, var_x, var_y, var_g) {
		this.props.onClick(plotType, var_x, var_y, var_g);
	},


	render: function() {
		return (
			<Navbar>
				<Nav>
					<DropdownButton title="File">
						<MenuItem onClick={this.handleClick.bind(this, "submit")}>Open</MenuItem>
						<FileField ref="file"/>
					</DropdownButton>
					<DropdownButton title="View">
						<MenuItem onClick={this.handleClick.bind(this, "show-table")}>Data table</MenuItem>
					</DropdownButton>
					<DropdownButton title="Plot">

						<ModalTrigger modal={<PlotModal onClick={this.plotClick.bind(this, "lineChart")} variables={this.props.variables}  />}>
							<MenuItem>Line</MenuItem>
						</ModalTrigger>

						<ModalTrigger modal={<PlotModal onClick={this.uniClick} variables={this.props.variables}  />}>
							<MenuItem onClick={this.handleClick.bind(this, "plot", "scatterChart")}>Scatter</MenuItem>
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

	uniClick: function(child, variables, functions) {
		this.props.onClick(this, "stats", variables, functions);
	},

	biClick: function(child, var_x, var_y, functions) {
		this.props.onClick(this, "bivariate", var_x, var_y, functions);
	}
});