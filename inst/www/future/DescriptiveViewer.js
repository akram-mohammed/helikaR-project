var DescriptiveViewer = React.createClass(
{
	handleClick: function(buttonType, functionName, propertyName) {
		this.props.onClick(this, buttonType, functionName, propertyName);
	},

	render: function() {
		return(
			<button id="{this.props.id}" onClick={this.handleClick.bind(this, "descriptive", this.props.id, this.props.name)}>{this.props.name}</button>
		);
	}
});

