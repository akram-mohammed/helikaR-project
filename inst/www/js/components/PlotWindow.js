/*
 *	The plot frame
 */

var PlotWindow = React.createClass(
{
	render: function() {
		var url = this.props.path;
		if(url !== "")
		{
			var jsonFile = new XMLHttpRequest();
			jsonFile.open("GET", url, true);
			jsonFile.send();
			jsonFile.onreadystatechange = function () {
				if (jsonFile.readyState === 4 && jsonFile.status === 200) {
					var plotHTML = jsonFile.responseText;
					var plotArr = plotHTML.split("<head>");

					//temp static stuff
					var squeezeFrame = '<head>\n<script type="text/javascript" src="js/libs/squeezeFrame.js"></script>\n<script type="text/javascript">\n\tmyContainer="localhost/Statistical Computing/components.html";\n\tmyMax=0.25;\n\tmyRedraw="both";\n</script>';

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
		else {
			return (
				<iframe id="plot-frame"></iframe>
			);
		}
	}
});
