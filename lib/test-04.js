

var xchain = require('./main');
var util = require('util');

xchain(function(next) {
	next.foo = 1;
	util.debug('1');
	setTimeout(next, 1000);
}, function(next) {
	util.debug('2');
	next.bar = 2;
	setTimeout(next, 2000);
})(function(next) {
	util.debug('3');
	util.debug('next.foo = ' + next.foo);
	util.debug('next.bar = ' + next.bar);
	setTimeout(next, 1000);
})(function(next) {
	util.debug('4');
	next();
}).run();
