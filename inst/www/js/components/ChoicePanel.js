/*
 *	Variable plot selects
 */

var ChoicePanel = React.createClass(
{
	render: function() {
		var clist = [];
		this.props.choices.forEach(function(choice) {
			if(choice.axis === this.props.axis)
				clist.push(	<option name={choice.axis} id={choice.name}>
					{choice.name}
					</option>);
		}.bind(this));
		return (
			<select id={"variable-select-" + this.props.axis}>{clist}</select>
		);
	}
});
