#' Return arg + 1
#' 
#' @export
#' @import e1071
#' @import stats
#' @param tr_x train x
#' @param te_x test x
myfn <- function(fn, train, test, split) {
	tr_x <- subset(train, select=-get(split));
	tr_y <- subset(train, select=get(split))[,1];
	te_x <- subset(test, select=-get(split));
	te_y <- subset(test, select=get(split))[,1];

	if(fn != "hpart") {
		t <- table(predict(get(fn)(tr_x, as.factor(tr_y)), te_x), te_y);
	}	else {
		t <- table(predict(get(fn)(rpart(get(split) ~ ., data=train, method="class")), te_x), te_y);
	}
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
