/*
 *	Div for handsontable
 */

var HTable = React.createClass({

	getDefaultProps: function() {
		return {table: null, visible: false, table_id: 0};
	},

	componentDidMount: function() {
		var asc = true;
		Handsontable.Dom.addEvent(document.getElementById("hot-div" + this.props.table_id), 'click', function (event) {
		    if (event.target.className === 'mod_button') {
		        var data = this.props.table.getData().filter(function (x) {

		        	// magic - check if all keys are null
		        	return !Object.keys(x).every(function (y) { return x[y] === null });

		        });

		        var key = event.target.getAttribute("name");
		        console.log(asc);
		        var sorted = sortByKey(data, key, asc);
		        asc = !asc;
		        this.props.table.loadData(sorted);
		    }
		}.bind(this));
	},

	setHeaders: function(headers) {
		this.props.table.updateSettings({
            colHeaders: function (col) {
            	// GHETTO - change later if necessary
            	// Sets markup of each column header 
        	    return "<b>" + headers[col] + "</b>" + "<button class='mod_button' name='" + headers[col] + "' style='margin-left: 10%;'>\u25BC</button>";
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
			<div id={"hot-div" + this.props.table_id} ref="tempref" style={{width: '500px', height: '500px', overflow: 'auto', margin: '1% auto'}}></div>
		);
	}
});

function sortByKey(array, key, asc) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        if(asc)
        	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
       	else
       		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}