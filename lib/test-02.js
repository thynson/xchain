
var xchain = require('./xchain');
var util = require('util');

xchain([1,3,4,5], function(next, val, idx) {
	util.debug('val = ' + val);
	util.debug('idx = ' + idx);
}).run();
