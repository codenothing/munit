# munit

Modular unit testing for javascript. munit was built to handle synchronous
and asynchronous tests easily with little developer intervention.

* Function spies for code flow testing
* Module priority ordering
* Module queueing for working with limited resources
* Module dependency for ordered queueing
* Focused test runs to run only specified modules
* Built in result formatting for CI's such as Jenkins

  
[![Build Status](https://travis-ci.org/codenothing/munit.png?branch=master)](https://travis-ci.org/codenothing/munit)  
  

### Installation

```sh
$ npm install munit
```


### Usage

```js
require( 'munit' ).render( '/path/to/test/dir' );
```

```
$ munit /path/to/test/dir
```


### Example

```js
// file: test.js
var munit = require( 'munit' );

munit( 'Sync', function( assert ) {
	assert.pass( 'sync-example' );
	assert.ok( 'boolean-test', true );
});

munit( 'Async', 2, function( assert ) {
	process.nextTick(function(){
		assert.equal( 'first-tick', 15.0, 15.0 );
		process.nextTick(function(){
			assert.pass( 'next-tick' );
		});
	});
});

munit.render();
```


```bash
$ node test.js 

Sync
Sync.sync-example
Sync.boolean-test

-- All 2 tests passed on Sync --


Async
Async.first-tick
Async.next-tick

-- All 2 tests passed on Async --



Tests Passed: 4
Tests Failed: 0
```


### Projects that use munit

* [munit](https://github.com/codenothing/munit/tree/master/test): This project uses itself for testing. It's usually on the latest released version.
* [Nlint](https://github.com/codenothing/Nlint/tree/master/test): Full project syntax linting
* [argv](https://github.com/codenothing/argv/tree/master/test): Cli argument handling
* [CSSTree](https://github.com/codenothing/CSSTree/tree/master/test): CSS to JS AST
* [CSSCompressor](https://github.com/codenothing/CSSCompressor/tree/master/test): CSS Minifier


### License

```
The MIT License

Copyright (c) 2012-2013 Corey Hart

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
