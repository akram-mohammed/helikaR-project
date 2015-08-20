#' Return arg + 1
#' 
#' @export
#' @import e1071
#' @import stats
#' @param tr_x train x
#' @param tr_y train y
#' @param te_x test x
#' @param te_y test y
myfn <- function(fn, tr_x, tr_y, te_x, te_y) {
	t <- table(predict(get(fn)(tr_x, as.factor(tr_y)), te_x), te_y);
	tp <- t[1];
	fp <- t[2];
	fn <- t[3];
	tn <- t[4];
	p <- tp / (tp + fp);
	r <- tp / (tp + fn);
	f <- 2 * p * r / (p + r);
	d <- data.frame(precision = p, recall = r, f_score = f);
	return(d);
}
