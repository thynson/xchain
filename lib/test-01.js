
var xchain = require('./main');
var util = require('util');

xchain(function(next) {
	next.foo = 1;
	util.debug('1');
	next();
}, function(next) {
	util.debug('2');
	next.bar = 2;
	next();
})(function(next) {
	util.debug('3');
	util.debug('next.foo = ' + next.foo);
	util.debug('next.bar = ' + next.bar);
	next();
})(function(next) {
	util.debug('4');
	next();
}).run();
