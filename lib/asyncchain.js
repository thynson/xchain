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


// Use closure to avoid variables for environment test code pollute the global
// namespace
(function(){

    var isNodeJS = false;
    var dispatchJob = null;

    if (typeof module !== 'undefined' && module.exports)
        isNodeJS = true;
    else if (typeof window === 'undefined')
        throw "Unknown environment";
    // else we should live in a browser

    if (isNodeJS) {
        dispatchJob = process.nextTick;
    } else {
        if (typeof setImmediate != 'undefined') {
            dispatchJob = setImmediate;
        } else {
            dispatchJob = function(callback) {
                setTimeout(0, callback);
            }
        }
    }

    // Class AsyncFlow constructor
    var AsyncChain =  function () {
        var pendingJobs = [];
        var currentJobs = null;

        var startNextJobs = function() {

            var count = currentJobs.length;

            currentJobs.forEach(function(callback) {
                var finished = false;
                callback({
                    end : function() {
                        // Avoid corrupt if this method is called multriple times
                        if (!finished) {
                            finished = true;
                            count--;

                            if (count == 0) {
                                if (pendingJobs.length == 0) {
                                    currentJobs = null;
                                    return;
                                }
                                currentJobs = pendingJobs.shift();
                                dispatchJob(startNextJobs);
                            }
                        }
                    },
                    abort : function() {
                        // Clear all the pending jobs, because this abortion
                        // break the dependency.
                        pendingJobs.splice(0);
                    }
                });
            });
        }

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

            currentJobs = pendingJobs.shift();
            dispatchJob(startNextJobs);
            return this;
        }

    }

    if (isNodeJS)
        module.exports.AsyncChain = AsyncChain;
    else
        window.AsyncChain = AsyncChain;
})();
