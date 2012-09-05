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

module.exports = function() {
    var pending = [];
    var current = null;
    var currentCount = 0; // So

    var execute = function() {
        if (pending.length > 0) {
            current = pending.shift();
            currentCount = current.length;
            dispatch();
        }
    }

    var next = function() {
        if (--currentCount == 0) {
            execute();
        }
    }

    var dispatch = function () {
        var count = current.length;
        current.forEach(function(callback) {
            process.nextTick(function() {
                callback(next);
            });
        });
    }

    var chain = function() {
        if (current) {
            return; // TODO: Throw exception here
        }

        if (util.isArray(arguments[0])) {
            if (typeof arguments[1] !== 'function') {
                throw new TypeError();
            }

            var array = arguments[0];
            var callback = arguments[1];

            pending.push(array.map(function(data, index) {
                return function(ctx) {
                    callback(ctx, data, index);
                };
            }));

        } else if (typeof arguments[0] === 'object') {
            if (typeof arguments[1] !== 'function') {
                throw new TypeError();
            }

            var funcs = [];
            var object = arguments[0];
            var callback = arguments[1];

            for (var p in object) {
                (function() {
                    var property = p;
                    funcs.push(function(ctx) {
                        callback(ctx, object[property], property);
                    });
                })();
            }
            pending.push(funcs);
        } else {
            var funcs = Array.prototype.slice.call(arguments);
            funcs.forEach(function(callback) {
                if (typeof callback !== 'function')
                    throw new TypeError();
            });
            pending.push(funcs);
        }
        return arguments.callee;
    }

    chain.run = function(errHandler) {
        if (current == null) {
            execute();
        }
    }

    return chain.apply(null, arguments);
}
