/*
 * Copyright (C) 2012 LAN Xingcan
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */


// Class AsyncFlow constructor
var AsyncChain =  function () {
	var pendingJobs = [];
	var currentJobs = null;

	//
	// Append a list of parallel job, each job is a function that has a
	// parameter represent the job context. The context objects have two
	// method: .end() and .abort(). When .end() method is called, you mean
	// this job is successfuly done. and if all the parallel job is
	// seccessfuly done, next parallel jobs will start.
	//
	// e.g.:
	//  var af = new AsyncFlow();
	//  af.append([
	//    	function(ctx) { /* Do something */ },
	//    	function(ctx) { /* Do something else */},
	//    	...
	//  ]).append([
	//  	function(ctx) { /* This job depends on the above jobs */ }
	//  ]);
	//
	this.append = function(jobs) {
		pendingJobs.push(jobs);

		if (currentJobs) {
			return this;
		}

		var startJobs = function() {

			if (pendingJobs.length == 0)
				return;

			currentJobs = pendingJobs.shift();
			var count = currentJobs.length;

			currentJobs.forEach(function(callback) {
				var finished = false;
				callback({
					end : function() {
						// Avoid corrupt if this method is called multriple times
						if (!finished) {
							finished = true;
							count--;

							if (count == 0)
								startJobs();
						}
					},
					abort : function() {
						pendingJobs.clear();
					}
				});
			});

		}
		startJobs();
        return this;
	}
}

module.exports.AsyncChain = AsyncChain;
