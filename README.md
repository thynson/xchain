AsyncChain
==========

AsyncChain is designed for simplifying async logic.
Considering the following code(I expect you have some experiences of jquery):
```javascript
$.get('/index', function(obj){
	// Because GET /details/{index} depends on GET /index we have to do this
	// after GET /index completed.
	$.get('/detail/' + obj.index, function(obj) {

	}, 'json');
}, 'json');
```
But what if there are multriple dependencies, and dependency chain got longer
and longer?  Yeah, indent will go deeper and deeper, and more and more sucks.
So with **AsyncChain**, you do write the code like this:
```
var x = new AsyncChain();
var data = {};

x.append([
	function(ctx1) {
		$.get('/first/a', function(obj) {
			data.a = obj
			ctx1.end();
		}, 'json');
	},
	function(ctx2) {
		$.get('/first/b', function(obj) {
			data.b = obj
			ctx2.end();
		}, 'json');
	}
]).append([
	function(ctx) {
		// This function will not be called until ctx1.end() and ctx2.end()
		// be called, this ensure all the dependencies got satisfied.
		$.get('/second/ + F(data), function(obj) {
			data = obj;
			ctx.end();
		}, 'json');
	}
]).append([
	//...
])//...
```
If you're using node.js, use it like that:
```javascript
var asyncchain = require('asyncchain');
var x = new x.AsyncChain();
//...
```
