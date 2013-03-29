# MUnit

Modular unit testing for javascript. MUnit was built to handle synchronous
and asynchronous tests easily with little developer intervention.


### Installation

```sh
$ npm install munit
```


### Usage

```js
var MUnit = require( 'munit' );

MUnit.render( '/path/to/test/dir' );
```


### Example

```js
// file: test.js
var MUnit = require( 'munit' );

MUnit( 'Sync', function( assert ) {
	assert.pass( 'sync-example' );
	assert.ok( 'boolean-test', true );
});

MUnit( 'Async', 2, function( assert ) {
	process.nextTick(function(){
		assert.equal( 'first-tick', 15.0, 15.0 );
		process.nextTick(function(){
			assert.pass( 'next-tick' );
		});
	});
});

MUnit.render();
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


### Queue

Queueing allows modules to not be triggered until they have a settings object to work with.
This settings object may get passed from module to module as needed.


```js
// file: queue.js
var MUnit = require( 'munit' );

// Add queue object
MUnit.Queue.add({ flag: true });

// Sync waiter
MUnit.Queue( 'Waiter1', function( settings, assert ) {
	assert.equal( 'flag', settings.flag, true );
});

// Asnyc Waiter
MUnit.Queue( 'Waiter2', 1, function( settings, assert ) {
	process.nextTick(function(){
		assert.equal( 'flag', settings.flag, true );
	});
});

MUnit.render();
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

MUnit also allows for more specific queuing for cases where there is only 1 resource, but multiple queue objects.

```js
// file: complex-queue.js
var MUnit = require( 'munit' );

// Add queue object
MUnit.Queue.add({ key1: 123 });
MUnit.Queue.add({ key2: 456 });

// Sync waiter
MUnit.Queue( 'Waiter1', 'key1', function( settings, assert ) {
	assert.equal( 'key', settings.key1, 123 );
});

// Asnyc Waiter
MUnit.Queue( 'Waiter2', 'key2', function( settings, assert ) {
	assert.equal( 'key', settings.key2, 456 );
});

MUnit.render();
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
All options are optional, with preset defaults set in MUnit.Defaults.Settings.

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
MUnit( 'test', function( assert ) {
	var a = 9;
	assert.ok( 'basic', a == 9 );
});
```

**.pass( name )**  
Marks test as passed.
```js
MUnit( 'test', function( assert ) {
	assert.pass( 'success' );
});
```

**.fail( name )**  
Marks test as failed.
```js
MUnit( 'test', function( assert ) {
	assert.fail( 'error' );
});
```

**.isTrue( name, value )**  
Checks that value is true.
```js
MUnit( 'test', function( assert ) {
	assert.isTrue( 'true test', true );
});
```

**.isFalse( name, value )**  
Checks that value is false.
```js
MUnit( 'test', function( assert ) {
	assert.isFalse( 'false test', false );
});
```

**.isUndefined( name, value )**  
Checks that value is undefined.
```js
MUnit( 'test', function( assert ) {
	assert.isUndefined( 'undefined test', undefined );
});
```

**.isNull( name, value )**  
Checks that value is null.
```js
MUnit( 'test', function( assert ) {
	assert.isNull( 'null test', null );
});
```

**.isBoolean( name, value )**  
Checks that value is Boolean object.
```js
MUnit( 'test', function( assert ) {
	assert.isBoolean( 'boolean test', true );
});
```

**.isNumber( name, value )**  
Checks that value is Number object.
```js
MUnit( 'test', function( assert ) {
	assert.isNumber( 'number test', 14 );
});
```

**.isString( name, value )**  
Checks that value is String object.
```js
MUnit( 'test', function( assert ) {
	assert.isString( 'string test', 'correct' );
});
```

**.isFunction( name, value )**  
Checks that value is function.
```js
MUnit( 'test', function( assert ) {
	assert.isFunction( 'function test', function(){} );
});
```

**.isArray( name, value )**  
Checks that value is Array object.
```js
MUnit( 'test', function( assert ) {
	assert.isArray( 'array test', [1,2,3] );
});
```

**.isDate( name, value )**  
Checks that value is Date object.
```js
MUnit( 'test', function( assert ) {
	assert.isDate( 'date test', new Date );
});
```

**.isRegExp( name, value )**  
Checks that value is RegExp object.
```js
MUnit( 'test', function( assert ) {
	assert.isRegExp( 'regex test', /[a-z0-9]/i );
});
```

**.isObject( name, value )**  
Checks that value is an Object.
```js
MUnit( 'test', function( assert ) {
	assert.isObject( 'object test', { a: 1 } );
});
```

**.isError( name, value )**  
Checks that value is Error object.
```js
MUnit( 'test', function( assert ) {
	assert.isError( 'error test', new Error( 'foo' ) );
});
```

**.exists( name, value )**  
Checks that value exists (non null/undefined).
```js
MUnit( 'test', function( assert ) {
	assert.exists( 'exists test', 'abc' );
});
```

**.empty( name, value )**  
Checks that value is null or undefined.
```js
MUnit( 'test', function( assert ) {
	assert.empty( 'exists test', null );
});
```

**.equal( name, actual, expected )**  
Does strict comparison of actual to expected.
```js
MUnit( 'test', function( assert ) {
	assert.equal( 'equality', 10, 10 );
});
```

**.notEqual( name, actual, expected )**  
Does strict comparison of actual to expected.
```js
MUnit( 'test', function( assert ) {
	assert.notEqual( 'non-equality', 10, '10' );
});
```

**.deepEqual( name, actual, expect )**  
Does deep object comparison of actual to expected. Uses nodes deepEqual internally.
```js
MUnit( 'test', function( assert ) {
	assert.deepEqual( 'deep-check', [ 1, 2, 3 ], [ 1, 2, 3 ] );
});
```

**.notDeepEqual( name, actual, expect )**  
Does deep object comparison of actual to expected. Uses nodes deepEqual internally.
```js
MUnit( 'test', function( assert ) {
	assert.notDeepEqual( 'Objects dont match', { a: true }, { a: false } );
});
```

**.throws( name, [ error, ] block )**  
Ensures block throws an error. Uses nodes throws internally.
```js
MUnit( 'test', function( assert ) {
	assert.throws( 'error thorwn', function(){
		throw new Error( 'Check 123' );
	});
});
```
**.doesNotThrow( name, [ error, ] block )**  
Marks test as passed.
```js
MUnit( 'test', function( assert ) {
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
MUnit( 'Test', function( assert ) {
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


## License
```
The MIT License

Copyright (c) 2012 Corey Hart

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
