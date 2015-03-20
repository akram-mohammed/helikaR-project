library(shiny)

shinyServer(function(input, output) {

  output$barGraph <- reactive(faithful[, 2])
  
})
