/*
 *	Buttons that apply normalisation functions to a whole column
 */

var ColumnModifier = React.createClass(
{
	handleClick: function(buttonType, functionName) {
		this.props.onClick(this, buttonType, functionName);
	},

	render: function() {
		return (
			<button id="{this.props.id}" onClick={this.handleClick.bind(this, "modify", this.props.id)}>{this.props.name}</button>
		);
	}
});



