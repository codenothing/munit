# Spy

Spy objects are a tremendously useful feature to safely test internal function calls and control code flow.
They have been built to only work within an assert module context.

```
assert.spy( [ options ] );
assert.spy( object, property [, options ] );
```

```js
munit( 'test', function( assert ) {
	var object = { prop: munit.noop },
		spy = assert.spy( object, 'prop' );

	object.prop === spy; // true
});
```


### How spies work

When designated, spies overwrite the property on an object to provide useful inspection information.
The following is a sample function that looks for the string `FOOBAR` inside of a file

```js
var fs = require( 'fs' );

function findFoobar( path, callback ) {
	fs.readFile( path, function( e, contents ) {
		if ( e ) {
			callback( e );
		}
		else {
			callback( null, contents.indexOf( 'FOOBAR' ) > -1 );
		}
	});
};
```

Setting up a normal test case for this function would require creating 2 files, and 3 asynchronous test cases.

* Create one file that contains the string `FOOBAR` to test successful path
* Create one file that doesn't contain the string to test unsuccessful path
* And a final test to tries to open a file that doesn't exist, to make sure error handling is correct

This can be a tedious process at times, and requires extra care to make sure your asynchronous test case is correct.
But with spies, the test case can be completely synchronous without the need to create multiple files.

```js
munit( 'test-findFoobar', function( assert ) {
	var readSpy = assert.spy( fs, 'readFile' ),
		callback = assert.spy();
	
	// Test successful path
	readSpy.onCall(function( path, cb ) {
		cb( null, "blah blah FOOBAR blah blah" );
	});
	findFoobar( 'test.text', callback );
	assert.isTrue( 'FOOBAR found', callback.args[ 1 ] );
	
	// Test unsuccessful path
	readSpy.onCall(function( path, cb ) {
		cb( null, "blah blah blah" );
	});
	findFoobar( 'test.text', callback );
	assert.isFalse( 'FOOBAR not found', callback.args[ 1 ] );
	
	// Test read error 
	readSpy.onCall(function( path, cb ) {
		cb( "Test Error" );
	});
	findFoobar( 'test.text', callback );
	assert.equal( 'read error', callback.args[ 0 ], "Test Error" );
});
```


### options

* **passthru**: If true, triggers the original method when spy is called. Defaults to false.
* **returnValue**: Value returned when spy is triggered
* **onCall**: Callback triggered when spy is triggered. (Gets called before original method is triggered)
* **afterCall**: Callback triggered when spy is triggered. (Gets called after original method is triggered)


### spy.scope

Contains the scope that the last call was made in

```js
spy = assert.spy();
spy.call( process );
spy.scope === process;
```


### spy.args

Contains the arguments of the last call

```js
spy = assert.spy();
spy( 1, 2, 3 );
spy.args; // [ 1, 2, 3 ]
```


### spy.count

Counter for how many times the spy has been triggered

```js
spy = assert.spy();
spy();
spy.count; // 1
```


### spy.returnValue

Value returned from the call

```js
spy = assert.spy({ returnValue: 9 });
spy();
spy.returnValue; // 9
```


### spy.data

Object for storing dev information.

```js
spy = assert.spy();
spy.data.projectID = 'abc123';
```


### spy.history

Contains an array of the entire history of all calls made to the spy

```js
spy = assert.spy();
spy();
spy.history.length; // 1
```


### spy.option

Getter/Setter for spy options

```js
spy = assert.spy();
spy.option( 'returnValue', 'abc' );
spy.option( 'returnValue' ); // 'abc'
```


### spy.reset

Resets counter and call history for that spy

```js
spy = assert.spy();
spy();
spy.count; // 1
spy.reset();
spy.count; // 0
```


### spy.restore

Restores overwrite back to it's original state

```js
object = { prop: munit.noop };
spy = assert.spy( object, 'prop' );

object.prop === spy;
spy.restore();
object.prop === munit.noop;
```
