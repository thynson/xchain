var xchain = require('./main');
var util = require('util');

xchain(
	[4,3,2,1], function(next, elem, index) {
		util.log('[' + index + '] wait for ' + elem + ' secons');
		setTimeout(function() {
			util.log('[' + index + '] complete');
			next();
		}, elem * 1000);
	},
	{ a : 1, b : 2, c : 3 }, function(next, prop, value) {
		util.log('[' + prop + '] wait for ' + value + ' secons');
		setTimeout(function() {
			util.log('[' + prop + '] complete');
			next();
		}, value * 1000);
	},
	function(next) {
		util.log('[f] No wait');
		next();
	}
)(
	function() {
		util.log('All complete');
	}
).run(function(err) {
	util.log(err);
});

