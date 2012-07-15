# MUnit

Modular unit testing for javascript. MUnit was built to easily handle synchronous
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
* **timeout**: Number of milliseconds to wait for a module to complete. Only used in asynchronous module. Defaults to 3 seconds.
* **stopOnFail**: Exits the process when an error occurs. Defaults to false.
* **autoQueue**: Auto adds the queue object back to the stack once the module has completed. Defaults to true.
* **queue**: Defines module as a queue object. Set to true to take any object, or a string for specific object. Defaults to null.



### Assert

Assert objects are passed to each module for use with tests. There are a number of helper methods to make testing easier

* **ok( name, bool [, startFunction, extra ] )**: Basic root boolean test. Marks test as passed or failed based on the boolean parameter.
* **pass( name )**: Marks test as passed.
* **fail( name )**: Marks test as failed.
* **equal( name, actual, expected )**: Does strict comparison of actual to expected.
* **deepEqual( name, actual, expect )**: Does deep object comparison of actual to expected. Uses nodes deepEqual internally.
* **throws( name, [ error, ] block )**: Ensures block throws an error. Uses nodes throws internally.
* **doesNotThrow( name, [ error, ] block )**: Ensures block does not throw an error. Uses nodes doesNotThrow iternally.
