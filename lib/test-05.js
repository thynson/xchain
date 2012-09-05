
var xchain = require('./main');
var util = require('util');

xchain(function(next) {
	util.debug('1');
	throw { value : 1 };
}, function(next) {
	util.debug('2');
	throw { value : 2 };
})(function(next) {
	util.debug('3');
	util.debug('next.foo = ' + next.foo);
	util.debug('next.bar = ' + next.bar);
	throw { value : 3 };
})(function(next) {
	util.debug('Won\'t reach here.');
}).run(function(err, next) {
	switch (err.value) {
	case 1:
		util.debug('Handle exception 1')
		next.foo = 10;
		next();
		break;
	case 2:
		util.debug('Handle exception 2')
		next.bar = 20;
		next();
		break;
	default:
		// Do nothing
		break;;
	};
});
