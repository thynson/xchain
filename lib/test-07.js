var xchain = require('./main');
var util = require('util');

var throwError = function () {
	throw { error : 1 };
}

xchain(function(next) {
	setTimeout(function() {
		try {
			throwError();
		} catch (err) {
			// Call next with exception indicate error occurred
			next(err);
		}
	}, 100);
})(function(next) {
	util.log(next.error);
}).run(function(err, next){
	next.error = err.error;
	next();
});

