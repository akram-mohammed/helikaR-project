/*
 *	Div for handsontable
 */

var HTable = React.createClass({

	getDefaultProps: function() {
		return {table: null, visible: false};
	},

	setHeaders: function(headers) {
		this.props.table.updateSettings({
            colHeaders: function (col) {
            	// GHETTO - change later if necessary
            	// Sets markup of each column header 
        	    return "<b>" + headers[col] + "</b>" + "<button class='mod_button' name='" + col + "' style='margin-left: 10%;'>\u25BC</button>";
        	}
    	});
	},

	setData: function(data) {
		this.props.table.loadData(data);
	},

	displayOff: function() {
		this.props.visible = false;
		React.findDOMNode(this.refs.tempref).style.display = "none";
	},

	displayOn: function() {
		this.props.visible = true;
		React.findDOMNode(this.refs.tempref).style.display = 'block';
	},

	toggleDisplay: function() {
		if(!this.props.visible) 
			this.displayOn();
		else
			this.displayOff();
	},

	render: function() {

		return (
			<div ref="tempref" style={{width: '500px', height: '500px', overflow: 'auto', margin: '1% auto'}}></div>
		);
	}
});