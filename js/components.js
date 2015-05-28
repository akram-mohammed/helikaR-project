var PlotWindow = React.createClass(
{
	render: function() {
		var url = this.props.path;
		console.log(url);
		var jsonFile = new XMLHttpRequest();
		jsonFile.open("GET", url, true);
        jsonFile.send();
        jsonFile.onreadystatechange = function () {
            if (jsonFile.readyState === 4 && jsonFile.status === 200) {
            	var plotHTML = jsonFile.responseText;
            	var plotArr = plotHTML.split("<head>");
            	var squeezeFrame = '<head>\n<script type="text/javascript" src="js/squeezeFrame.js"></script>\n<script type="text/javascript">\n\tmyContainer="localhost/Helikar/index.html";\n\tmyMax=0.25;\n\tmyRedraw="both";\n</script>';

            	var plotFrame = document.getElementById("plot-frame").contentWindow.document;

            	plotFrame.open();
            	plotFrame.write(plotArr[0] + squeezeFrame + plotArr[1]);
            	plotFrame.close();
            }
    	}
    	return (
    		<iframe id="plot-frame"></iframe>
    	);
    }
});

var VarChoice = React.createClass(
{
	render: function() {
		return (
			<p>
			<input type="radio" name="{this.props.axis}" id="{this.props.name}">
			</input>
			<label r="{this.props.name}">
			<br>this.choice.name</br>
			</label>
			</p>
			);
	}
});

var ChoicePanel = React.createClass(
{
	render: function() {
		var clist = [];
		this.props.choices.forEach(function(choice) {
			clist.push(<VarChoice name={choice.name} axis={choice.axis} />);
			console.log(clist);
		});
		return (
			<p>{clist}</p>
			);
	}
});

// Static, for now
var ch = [
{name: "first", axis: "x"},
{name: "second", axis: "x"},
{name: "first", axis: "y"},
{name: "third", axis: "y"}
];

React.render(<ChoicePanel choices={ch} />, document.body);

React.render(<PlotWindow path="temp.html" />, document.body);