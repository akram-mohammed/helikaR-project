#' Return arg + 1
#' 
#' @export
#' @import e1071
#' @import stats
#' @param tr_x train x
#' @param tr_y train y
#' @param te_x test x
#' @param te_y test y
myfn <- function(tr_x, tr_y, te_x, te_y) {
	return(table(predict(naiveBayes(tr_x, tr_y), te_x), te_y));
}
