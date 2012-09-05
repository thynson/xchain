
var xchain = require('./xchain');
var util = require('util');

var obj = {
	a : 1,
	b : 2,
	c : 3
}
xchain(obj, function(next, val, prop) {
	util.debug('val = ' + val);
	util.debug('prop = ' + prop);
}).run();
