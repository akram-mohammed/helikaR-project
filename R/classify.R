#' Return arg + 1
#' 
#' @export
#' @import e1071
#' @import stats
#' @param tr_x train x
#' @param tr_y train y
#' @param ip input
classify <- function(tr_x, tr_y, ip) {
	classifier <- naiveBayes(tr_x, as.factor(tr_y));
	return(predict(classifier, ip));
}
