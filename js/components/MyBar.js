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
						<MenuItem onClick={this.handleClick.bind(this, "plot", "lineChart")}>Line</MenuItem>
						<MenuItem onClick={this.handleClick.bind(this, "plot", "scatterChart")}>Scatter</MenuItem>
						<ModalTrigger modal={<ChoiceModal />}>
							<MenuItem>Huehuehue</MenuItem>
						</ModalTrigger>
					</DropdownButton>
				</Nav>
			</Navbar>
		);
	}
});