var util = require('util');
var xchain = require('./main');

xchain(function(next) {
	setTimeout(function() {
		util.log('foo');
		next();
	}, 1000);
}, function(next) {
	setTimeout(function() {
		util.log('bar');
		next();
	}, 3000);
}).run();

xchain(function(next) {
	setTimeout(function() {
		util.log('dead');
		next();
	}, 2000);
}, function(next) {
	setTimeout(function() {
		util.log('beef');
		next();
	}, 4000);
}).run();
