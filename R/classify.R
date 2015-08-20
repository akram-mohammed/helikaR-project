#' Return arg + 1
#' 
#' @export
#' @import e1071
#' @import stats
#' @param tr_x train x
#' @param tr_y train y
#' @param ip input
classify <- function(fn, train, ip, split) {
	tr_x <- subset(train, select=-get(split));
	tr_y <- subset(train, select=get(split))[,1];
	classifier <- get(fn)(tr_x, as.factor(tr_y));
	return(predict(classifier, ip));
}
