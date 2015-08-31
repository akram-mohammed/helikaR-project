log_regression <- function(data, var_x, var_y, n) {
	attach(data);
	formula <- as.formula(paste0(var_y, " ~ I(", var_x, ") + ", paste0("I(", var_x, " ^ ", 2:3, collapse=") +"), ")"));
	model <- lm(formula);
	
}