library(shiny)

buildGraph <- function (outputId) 
{
	HTML(paste("<div id=\"", outputId, "\" class=\"shiny-output\"><svg /></div>", sep=""))
}

shinyUI(fluidPage(

	mainPanel(
		includeHTML("www/barplot.html"),
		buildGraph(outputId = "barGraph")
		)
	)
)
