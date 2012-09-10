# xchain

## Changes

* 0.4.3 -- Sep, 10th, 2012
    * Redefine the parameter form of xchain, now you can write

        ``` javascript
        xchain(
            [1, 2, 3], function(next, elem, index) {
                // ...
            },
            { a : 1, b : 2}, function(next, property, value) {
                // ...
            }, function(next) {
                // ...
            }
        )(
            // ...
        )
        ```

* 0.4.2 -- Sep. 8th, 2012
    * Add a way to handle async exception correctly. see test-07.js

* 0.4.0 -- Sep. 5th, 2012
    * This project is originally named as AsyncChain, which is a little long.

    * Inspired by [step], I desided to make API more clean. But still the design
      is very different from [step] and [flow-js], as I consider my way to handle
      error in async flow is more clear.

    * Only node.js is supported now. For browsers, another project named
      jquery-xchain will be born.

## Install
By simply type
```shell
npm install xchain
```

## Demos

You can go to see the testcases to know how to use it, they are very simple
and cover all points.

## License

[ISC] license, which is BSD-like and with simpler text.

[step]: http://github.com/creationix/step
[flow-js]: http://github.com/willconant/flow-js
[ISC]: http://www.isc.org/software/license

