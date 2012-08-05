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
var beginAsyncChain = function () {
    var pendingJobs = [];
    var currentJobs = null;
    var data = {};

    var startNextJobs = function() {
        for (var key in currentJobs) {
            (function(){
                var callback = currentJobs[key];
                var finished = false;
                dispatchJob(function() {
                    // Invoke callback with an async context object
                    callback({
                        end : function() {
                            // Avoid corrupt if this method is called multriple
                            // times
                            if (!finished) {
                                finished = true;
                                currentJobs.length--;

                                if (currentJobs.length == 0) {
                                    if (pendingJobs.length == 0) {
                                        currentJobs = null;
                                        return;
                                    }
                                    currentJobs = pendingJobs.shift();
                                    startNextJobs();
                                }
                            }
                        },
                        abort : function() {
                            // Clear all the pending jobs, because this
                            // abortion break the dependency.
                            pendingJobs.splice(0);
                        },
                        data : data
                    });
                });
            })();
        }
    }

    this.append = function() {
        pendingJobs.push(arguments);

        if (currentJobs) {
            return this;
        }

        currentJobs = pendingJobs.shift();
        startNextJobs();
        return this;
    }

    this.append.apply(this, arguments);
    return this;
}


// Environment test
var dispatchJob = (function(){

    var isNodeJS = false;
    var ret = null;

    if (typeof module !== 'undefined' && module.exports)
        isNodeJS = true;
    else if (typeof window === 'undefined')
        throw "Unknown environment";
    // else we should live in a browser

    if (isNodeJS) {
        module.exports.beginAsyncChain = beginAsyncChain;
        ret = process.nextTick;
    } else {
        window.beginAsyncChain = beginAsyncChain;
        if (typeof setImmediate != 'undefined') {
            ret = setImmediate;
        } else {
            ret = function(callback) {
                setTimeout(callback, 0);
            }
        }
    }

    return ret;
})();
