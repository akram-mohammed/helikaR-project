/*
 *	The panel with the modification buttons
 */

var ModificationPanel = React.createClass({
	handleClick: function(child, buttonType, functionName, propertyName) {
		this.props.onClick(this, buttonType, functionName, propertyName);
	},

	render: function() {
		return (
			<div id="pre-button-div" style={{display: 'none'}}>
				<ColumnModifier onClick={this.handleClick} id="fscale" name="Feature scaling" />
				<DescriptiveViewer onClick={this.handleClick} id="mean" name="Mean" />
				<DescriptiveViewer onClick={this.handleClick} id="median" name="Median" />
				<DescriptiveViewer onClick={this.handleClick} id="mode"	name="Mode"	/>
				<DescriptiveViewer onClick={this.handleClick} id="sd"	name="Standard deviation" />
				<DescriptiveViewer onClick={this.handleClick} id="variance" name="Variance"	/>
				<DescriptiveViewer onClick={this.handleClick} id="skewness" name="Skewness"	/>
				<DescriptiveViewer onClick={this.handleClick} id="kurtosis" name="Kurtosis"	/>				
	    	</div>
		);
	}
});

