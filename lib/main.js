/*
 * Copyright (C) 2012 LAN Xingcan <lanxingcan@gmail.com>
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

var util = require('util');

var defaultExceptionHandler = function() { }

module.exports = function() {
    var pending = [];
    var current = null;
    var currentCount = 0;
    var errorHandler = defaultExceptionHandler;

    var execute = function() {
        if (pending.length > 0) {
            current = pending.shift();
            currentCount = current.length;
            dispatch();
        }
    }

    var next = function() {
        if (arguments.length == 0) {
            if (--currentCount == 0) {
                execute();
            }
        } else {
            errorHandler(arguments[0], next);
        }
    }

    var dispatch = function () {
        var count = current.length;
        current.forEach(function(callback) {
            process.nextTick(function() {
                try {
                    callback(next);
                } catch (error) {
                    errorHandler(error, next);
                }
            });
        });
    }

    var chain = function() {
        if (current) {
            // TODO: Throw exception here, in this case the chain has run.
            return;
        }

        var arglist = Array.prototype.slice.call(arguments);
        var funcs = [];
        var array = null;
        var object = null;

        var checkState = function() {
            if (array || object) {
                throw new TypeError();
            }
        }

        arglist.forEach(function(i) {
            if (typeof i === 'function') {
                if (array) {
                    array.forEach(function(j, idx) {
                        funcs.push(function(next) {
                            i(next, j, idx);
                        });
                    });
                    array = null;
                } else if (object) {
                    for(var p in object) {
                        (function(p, v) {
                            funcs.push(function(next) {
                                i(next, p, v);
                            });
                        })(p, object[p]);
                    }
                    object = null;
                } else {
                    funcs.push(i);
                }
            } else if (util.isArray(i)) {
                checkState();
                array = i;
            } else if (typeof i === 'object') {
                checkState();
                object = i;
            } else {
                throw new TypeError();
            }
        });
        checkState();
        pending.push(funcs);

        return chain;
    }

    chain.run = function(errHandler) {
        if (current == null) {
            if (errHandler)
                errorHandler = errHandler;
            execute();
        }
    }

    return chain.apply(null, arguments);
}
