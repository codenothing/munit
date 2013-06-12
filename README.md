# munit

Modular unit testing for javascript. munit was built to handle synchronous
and asynchronous tests easily with little developer intervention.

  
[![Build Status](https://travis-ci.org/codenothing/munit.png?branch=master)](https://travis-ci.org/codenothing/munit)  
  

### Installation

```sh
$ npm install munit
```


### Usage

```js
require( 'munit' ).render( '/path/to/test/dir' );
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


### queue

Queueing allows modules to not be triggered until they have a settings object to work with.
This settings object may get passed from module to module as needed.


```js
// file: queue.js
var munit = require( 'munit' );

// Add queue object
munit.queue.add({ flag: true });

// Sync waiter
munit.queue( 'Waiter1', function( settings, assert ) {
	assert.equal( 'flag', settings.flag, true );
});

// Asnyc Waiter
munit.queue( 'Waiter2', 1, function( settings, assert ) {
	process.nextTick(function(){
		assert.equal( 'flag', settings.flag, true );
	});
});

munit.render();
```

```bash
$ node queue.js 

Waiter1
Waiter1.flag

-- All 1 tests passed on Waiter1 --


Waiter2
Waiter2.flag

-- All 1 tests passed on Waiter2 --



Tests Passed: 2
Tests Failed: 0
```

munit also allows for more specific queuing for cases where there is only 1 resource, but multiple queue objects.

```js
// file: complex-queue.js
var munit = require( 'munit' );

// Add queue object
munit.queue.add({ key1: 123 });
munit.queue.add({ key2: 456 });

// Sync waiter
munit.queue( 'Waiter1', 'key1', function( settings, assert ) {
	assert.equal( 'key', settings.key1, 123 );
});

// Asnyc Waiter
munit.queue( 'Waiter2', 'key2', function( settings, assert ) {
	assert.equal( 'key', settings.key2, 456 );
});

munit.render();
```

```bash
$ node complex-queue.js 

Waiter1
Waiter1.key

-- All 1 tests passed on Waiter1 --


Waiter2
Waiter2.key

-- All 1 tests passed on Waiter2 --



Tests Passed: 2
Tests Failed: 0
```


### Options

All options inherit from parent modules, with the object passed into the module definition overwriting existing settings.
All options are optional, with preset defaults set in munit.defaults.settings.

* **expect**: Number of expected tests to run. When less than 1, assumes synchronous module. Defaults to 0
* **priority**: Priority level of the test. Give higher priority for tests that should run first. Defaults to 0.5
* **timeout**: Number of milliseconds to wait for a module to complete. Only used in asynchronous module. Defaults to 3 seconds.
* **stopOnFail**: Exits the process when an error occurs. Defaults to false.
* **autoQueue**: Auto adds the queue object back to the stack once the module has completed. Defaults to true.
* **queue**: Defines module as a queue object. Set to true to take any object, or a string for specific object. Defaults to null.



### Assert

Assert objects are passed to each module for use with tests. There are a number of helper methods to make testing easier  
  
  
**.ok( name, bool [, startFunction, extra ] )**  
Basic root boolean test. Marks test as passed or failed based on the boolean parameter.
```js
munit( 'test', function( assert ) {
	var a = 9;
	assert.ok( 'basic', a == 9 );
});
```

**.pass( name )**  
Marks test as passed.
```js
munit( 'test', function( assert ) {
	assert.pass( 'success' );
});
```

**.fail( name )**  
Marks test as failed.
```js
munit( 'test', function( assert ) {
	assert.fail( 'error' );
});
```

**.isTrue( name, value )**  
Checks that value is true.
```js
munit( 'test', function( assert ) {
	assert.isTrue( 'true test', true );
});
```

**.isFalse( name, value )**  
Checks that value is false.
```js
munit( 'test', function( assert ) {
	assert.isFalse( 'false test', false );
});
```

**.isUndefined( name, value )**  
Checks that value is undefined.
```js
munit( 'test', function( assert ) {
	assert.isUndefined( 'undefined test', undefined );
});
```

**.isNull( name, value )**  
Checks that value is null.
```js
munit( 'test', function( assert ) {
	assert.isNull( 'null test', null );
});
```

**.isBoolean( name, value )**  
Checks that value is Boolean object.
```js
munit( 'test', function( assert ) {
	assert.isBoolean( 'boolean test', true );
});
```

**.isNumber( name, value )**  
Checks that value is Number object.
```js
munit( 'test', function( assert ) {
	assert.isNumber( 'number test', 14 );
});
```

**.isString( name, value )**  
Checks that value is String object.
```js
munit( 'test', function( assert ) {
	assert.isString( 'string test', 'correct' );
});
```

**.isFunction( name, value )**  
Checks that value is function.
```js
munit( 'test', function( assert ) {
	assert.isFunction( 'function test', function(){} );
});
```

**.isArray( name, value )**  
Checks that value is Array object.
```js
munit( 'test', function( assert ) {
	assert.isArray( 'array test', [1,2,3] );
});
```

**.isDate( name, value )**  
Checks that value is Date object.
```js
munit( 'test', function( assert ) {
	assert.isDate( 'date test', new Date );
});
```

**.isRegExp( name, value )**  
Checks that value is RegExp object.
```js
munit( 'test', function( assert ) {
	assert.isRegExp( 'regex test', /[a-z0-9]/i );
});
```

**.isObject( name, value )**  
Checks that value is an Object.
```js
munit( 'test', function( assert ) {
	assert.isObject( 'object test', { a: 1 } );
});
```

**.isError( name, value )**  
Checks that value is Error object.
```js
munit( 'test', function( assert ) {
	assert.isError( 'error test', new Error( 'foo' ) );
});
```

**.exists( name, value )**  
Checks that value exists (non null/undefined).
```js
munit( 'test', function( assert ) {
	assert.exists( 'exists test', 'abc' );
});
```

**.empty( name, value )**  
Checks that value is null or undefined.
```js
munit( 'test', function( assert ) {
	assert.empty( 'exists test', null );
});
```

**.equal( name, actual, expected )**  
Does strict comparison of actual to expected.
```js
munit( 'test', function( assert ) {
	assert.equal( 'equality', 10, 10 );
});
```

**.notEqual( name, actual, expected )**  
Does strict comparison of actual to expected.
```js
munit( 'test', function( assert ) {
	assert.notEqual( 'non-equality', 10, '10' );
});
```

**.greaterThan( name, upper, lower )**  
Does greater than check of upper to lower.
```js
munit( 'test', function( assert ) {
	assert.greaterThan( 'greater than', 10, 5 );
});
```

**.lessThan( name, lower, upper )**  
Does less than check of lower to upper.
```js
munit( 'test', function( assert ) {
	assert.lessThan( 'less than', 7, 9 );
});
```

**.deepEqual( name, actual, expect )**  
Does deep object comparison of actual to expected. Uses nodes deepEqual internally.
```js
munit( 'test', function( assert ) {
	assert.deepEqual( 'deep-check', [ 1, 2, 3 ], [ 1, 2, 3 ] );
});
```

**.notDeepEqual( name, actual, expect )**  
Does deep object comparison of actual to expected. Uses nodes deepEqual internally.
```js
munit( 'test', function( assert ) {
	assert.notDeepEqual( 'Objects dont match', { a: true }, { a: false } );
});
```

**.throws( name, [ error, ] block )**  
Ensures block throws an error. Uses nodes throws internally.
```js
munit( 'test', function( assert ) {
	assert.throws( 'error thorwn', /Check 123/, function(){
		throw new Error( 'Check 123' );
	});
});
```
**.doesNotThrow( name, block )**  
Tests to ensure block doesn't throw an error
```js
munit( 'test', function( assert ) {
	assert.doesNotThrow( 'doesnt throw', function(){
		" test ".trim();
	});
});
```

**.log( [ name, ] msg1 [, msg2, ...] )**  
Attaches logs to the module/test which will be printed out with the results.
* If a name is passed, then the log is attached to that test, will get printed out above the test result
* If no name is passed, then the messages will get printed out at the start of the module results

```js
munit( 'Test', function( assert ) {
	assert.log( [ 1, 2, 3 ] );
	assert.log( 'first', 9, 8, 7 );
	assert.pass( 'first' );
});

//
// [ 1, 2, 3 ]
//
// Test
// 9, 8, 7
// Test.first
//
// -- All 1 tests passed on Sync --
//
//
// Tests Passed: 4
// Tests Failed: 0
```

## Todo

1. Introspection to add variable names to failed tests
2. --focus: Ability to only run defined tests
3. Module dependency. Waiting for modules to complete before running others.
4. Cluster management.


## License
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
