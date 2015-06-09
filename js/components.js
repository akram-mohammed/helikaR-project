var Alert = ReactBootstrap.Alert;
var Navbar = ReactBootstrap.Navbar,
Button = ReactBootstrap.Button,
Nav = ReactBootstrap.Nav,
NavItem = ReactBootstrap.NavItem,
DropdownButton = ReactBootstrap.DropdownButton,
MenuItem = ReactBootstrap.MenuItem,
Modal = ReactBootstrap.Modal,
ModalTrigger = ReactBootstrap.ModalTrigger,
Input = ReactBootstrap.Input;

function getOption(axis) {
	var select = document.getElementById("variable-select-" + axis);
	return select.options[select.selectedIndex].value;
}

function Column(functionName, preCol) {

    var i;

    this.functionName = functionName;
    this.preCol = preCol;
    this.sortedCol = preCol;
    this.sortedCol.sort();
    this.mean = this.preCol.reduce(function (a, b) { return a + b; }, 0) / this.preCol.length;
    this.median = 0;	// init

    var length = this.preCol.length - 1;
    if(length % 2 === 0) {
    	this.median = this.sortedCol[length / 2];
    }
    else {
    	var low = this.sortedCol[(length - 1) / 2];
    	var high = this.sortedCol[(length + 1) / 2];
    	this.median = (low + high) / 2;
    }

    this.getCentralMoment = function(n) {
    	var sum = 0;
    	for (i = 0; i < this.preCol.length; i++) {
    		var temp = Math.pow(this.preCol[i] - this.mean, n);
        	sum += temp;
        }
        return sum / (this.preCol.length - 1);
    }

    this.variance = this.getCentralMoment(2);
    this.sd = Math.sqrt(this.variance);


    this.skewness = this.getCentralMoment(3) / Math.pow(this.sd, 3);
    this.kurtosis = this.getCentralMoment(4) / Math.pow(this.sd, 4);
   	 
    // apply function by name
    this.applyFunction = function () {
        return this[this.functionName]();
    };

    this.getProperty = function() {
    	return this[this.functionName];
    }

    this.getLength = function() {
    	return this.preCol.length;
    }

    // Feature scaling
    this.fscale = function () {
        var min = Math.min.apply(null, this.preCol);
        var max = Math.max.apply(null, this.preCol);
        return this.preCol.map(function (elem) {
            return (elem - min) / (max - min);
        });
    };
}

function getIndex(table, str) {
	var headers = table.getColHeader();
	for(var i = 0; i < headers.length; i++) {
		if(headers[i].indexOf(str) > -1) {
			return i;
		}
	}
}


React.render(<WholeThing />, document.body);

