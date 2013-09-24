# Assert

Assert objects are passed to each module for use with tests. There are a number of helper methods to make testing easier.


### ok

Basic root boolean test. Marks test as passed or failed based on the boolean parameter.

```
.ok( name, bool [, startFunction, extra ] )
```

```js
munit( 'test', function( assert ) {
	var a = 9;
	assert.ok( 'basic', a == 9 );
});
```


### pass

Marks test as passed.

```
.pass( name )
```

```js
munit( 'test', function( assert ) {
	assert.pass( 'success' );
});
```


### fail

Marks test as failed.

```
.fail( name )
```

```js
munit( 'test', function( assert ) {
	assert.fail( 'error' );
});
```


### skip

Marks test as skipped

```
.skip( name, reason )
```

```js
munit( 'test', function( assert ) {
	assert.skip( 'keep-alive', "Server doesn't support keep-alive header" );
});
```


### isTrue

Checks that value is true.

```
.isTrue( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isTrue( 'true test', true );
});
```


### isFalse

Checks that value is false.

```
.isFalse( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isFalse( 'false test', false );
});
```


### isUndefined

Checks that value is undefined.

```
.isUndefined( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isUndefined( 'undefined test', undefined );
});
```


### isNull

Checks that value is null.

```
.isNull( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isNull( 'null test', null );
});
```


### isBoolean

Checks that value is Boolean object.

```
.isBoolean( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isBoolean( 'boolean test', true );
});
```


### isNumber

Checks that value is Number object.

```
.isNumber( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isNumber( 'number test', 14 );
});
```


### isString

Checks that value is String object.

```
.isString( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isString( 'string test', 'correct' );
});
```


### isFunction

Checks that value is function.

```
.isFunction( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isFunction( 'function test', function(){} );
});
```


### isArray

Checks that value is Array object.

```
.isArray( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isArray( 'array test', [1,2,3] );
});
```


### isDate

Checks that value is Date object.

```
.isDate( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isDate( 'date test', new Date );
});
```


### isRegExp

Checks that value is RegExp object.

```
.isRegExp( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isRegExp( 'regex test', /[a-z0-9]/i );
});
```


### isObject

Checks that value is an Object.

```
.isObject( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isObject( 'object test', { a: 1 } );
});
```


### isError

Checks that value is Error object.

```
.isError( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.isError( 'error test', new Error( 'foo' ) );
});
```


### exists

Checks that value exists (non null/undefined).

```
.exists( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.exists( 'exists test', 'abc' );
});
```


### empty

Checks that value is null or undefined.

```
.empty( name, value )
```

```js
munit( 'test', function( assert ) {
	assert.empty( 'exists test', null );
});
```


### equal

Does strict comparison of actual to expected.

```
.equal( name, actual, expected )
```

```js
munit( 'test', function( assert ) {
	assert.equal( 'equality', 10, 10 );
});
```


### notEqual

Does strict comparison of actual to expected.

```
.notEqual( name, actual, expected )
```

```js
munit( 'test', function( assert ) {
	assert.notEqual( 'non-equality', 10, '10' );
});
```


### greaterThan

Does greater than check of upper to lower.

```
.greaterThan( name, upper, lower )
```

```js
munit( 'test', function( assert ) {
	assert.greaterThan( 'greater than', 10, 5 );
});
```


### lessThan

Does less than check of lower to upper.

```
.lessThan( name, lower, upper )
```

```js
munit( 'test', function( assert ) {
	assert.lessThan( 'less than', 7, 9 );
});
```


### deepEqual

Does deep object comparison of actual to expected. Uses nodes deepEqual internally.

```
.deepEqual( name, actual, expect )
```

```js
munit( 'test', function( assert ) {
	assert.deepEqual( 'deep-check', [ 1, 2, 3 ], [ 1, 2, 3 ] );
});
```


### notDeepEqual

Does deep object comparison of actual to expected. Uses nodes deepEqual internally.

```
.notDeepEqual( name, actual, expect )
```

```js
munit( 'test', function( assert ) {
	assert.notDeepEqual( 'Objects dont match', { a: true }, { a: false } );
});
```


### throws

Ensures block throws an error. Uses nodes throws internally.

```
.throws( name, [ error, ] block )
```

```js
munit( 'test', function( assert ) {
	assert.throws( 'error thorwn', /Check 123/, function(){
		throw new Error( 'Check 123' );
	});
});
```


### doesNotThrow

Tests to ensure block doesn't throw an error

```
.doesNotThrow( name, block )
```

```js
munit( 'test', function( assert ) {
	assert.doesNotThrow( 'doesnt throw', function(){
		" test ".trim();
	});
});
```


### dateEquals

Tests that two date objects match (using Date.getTime)

```
.dateEquals( name, actual, expected )
```

```js
munit( 'test', function( assert ) {
	assert.dateEquals( 'date objects match', new Date( 13729374 ), new Date( 13729374 ) );
});
```


### spy

Creates and returns a spy object for enhanced testing.

```
.spy( [ object, method [, options ] ] )
```

```js
munit( 'test', function( assert ) {
	var fs = require( 'fs' ),
		assert.spy( fs, 'readFile' );

	fs.readFile( '/path.js', munit.noop );
	spy.count; // == 1
});
```


### log

Attaches logs to the module/test which will be printed out with the results.
* If a name is passed, then the log is attached to that test, will get printed out above the test result
* If no name is passed, then the messages will get printed out at the start of the module results

```
.log( [ name, ] msg1 [, msg2, ...] )
```

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


### close

Marks module as finished. Should only be used for async modules when no more tests are going to run.

```
.close()
```

```
munit( 'async', { isAsync: true, expect: 5 }, function(){
	assert.pass( 'passed' );
	setTimeout(function(){
		// No more tests should be run
		assert.close();
	}, 100);
});
```


### module

Creates a submodule of the current assert module. Can only be used during initialization

```
.module( name, [ options, ] callback )
```

```js
var core = munit( 'Core Util' );

core.module( 'array.isArray', function( assert ) {
	// tests go here...
});
```


### custom

Custom assertion creation. Assertions will only be applied to this module and it's current submodules.
Preferred to use munit.custom instead.

```
.custom( name, handle )
```

```js
var core = munit( 'Core Util' );

core.module( 'my test', function( assert ) {
	assert.isEven( 'check even', 2 );
});

core.custom( 'isEven', function( name, value ) {
	return this.ok( name, value % 2 === 0, this.isEven, "Value '" + value + "' is not even" );
});

```


### option

Getter/Setter of options for the assert module.

```
.option( name [, value ] )
```

```js
munit( 'test', function( assert ) {
	assert.option( 'expect', 10 );
});
```
