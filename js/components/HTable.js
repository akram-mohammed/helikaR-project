/*
 *	Div for handsontable
 */

var HTable = React.createClass({

	getDefaultProps: function() {
		return {table: null, show: false};
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

	toggleDisplay: function() {
		this.props.show = !this.props.show;
		if(!this.props.show) {
			React.findDOMNode(this.refs.tempref).style.display = "none";
		}
		else {
			React.findDOMNode(this.refs.tempref).style.display = "block";
		}

	},

	render: function() {

		return (
			<div ref="tempref"></div>
		);
	}
});