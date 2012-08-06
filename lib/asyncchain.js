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

var create = function (data) {
    var pendingJobs = [];
    var currentJobs = null;
    data = data || {};

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

    return {
        append : function() {
            if (currentJobs) {
                throw "AsyncChain has began";
            }
            pendingJobs.push(arguments);
            return this;
        },
        begin : function() {
            if (currentJobs == null) {
                currentJobs = pendingJobs.shift();
                startNextJobs();
            }
        }

    };
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
        module.exports.create = create;
        ret = process.nextTick;
    } else {
        window.AsyncChain = { create : create };
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
