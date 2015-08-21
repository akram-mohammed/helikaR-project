var FileField = React.createClass({
	render: function() {
		return (
			<input type="file" style={{display: "none"}} id="invis-file" accept=".csv, .xls, .xlsx" />	
		);
	}
});