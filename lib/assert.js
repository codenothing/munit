var munit = global.munit,
	Slice = Array.prototype.slice,
	_added = 0;


function Assert( nsPath, parAssert, options, callback ) {
	var self = this;

	if ( ! ( self instanceof Assert ) ) {
		return new Assert( nsPath, parAssert, options, callback );
	}
	else if ( callback === undefined && munit.isFunction( options ) ) {
		callback = options;
		options = null;
	}

	// Setup
	self.nsPath = nsPath;
	self.parAssert = parAssert;
	self.options = options || {};
	self.list = [];
	self.tests = {};
	self.ns = {};
	self.data = munit.extend( true, {}, self.options.data || {} );
	self.count = 0;
	self.passed = 0;
	self.failed = 0;
	self.skipped = 0;
	self.callback = callback;
	self.queue = null;
	self.start = 0;
	self.end = 0;
	self.isAsync = false;
	self.state = munit.ASSERT_STATE_DEFAULT;
	self._added = ++_added;
	self._timeid = null;
	self._logs = [];
	self._spies = [];
	self._spyOrder = 0;
}

Assert.prototype = {

	// Prints module results to cli
	_flush: function(){
		var self = this,
			logs = self._filterLogs(),
			all = logs.all,
			keys = logs.keys,
			time = munit._relativeTime( self.end - self.start );

		// Root module
		if ( ! self.callback ) {
			munit.color.green( "=== All submodules of " + self.nsPath + " have finished ===" );
			return;
		}

		// Content
		munit.color.blue( "\n" + self.nsPath );
		munit.each( self.tests, function( test ) {
			if ( keys[ test.name ] && keys[ test.name ].length ) {
				keys[ test.name ].forEach(function( args ) {
					munit.log.apply( munit, args );
				});
			}

			if ( test.error ) {
				munit.color.red( test.ns );
				munit.log( "\n", test.error.stack );
				munit.log( "\n" );
			}
			else if ( test.skip ) {
				munit.color.gray( "[skipped] " + test.ns );
				munit.color.gray( "\treason: " + test.skip );
			}
			else {
				munit.color.green( test.ns );
			}
		});

		// Logs made after the final test
		if ( all.length ) {
			all.forEach(function( args ) {
				munit.log.apply( munit, args );
			});
		}

		// Final Output
		if ( self.failed ) {
			munit.color.red( "\n-- " + self.failed + " tests failed on " + self.nsPath + " (" + time + ") --\n" );
		}
		else {
			munit.color.green( "\n-- All " + self.passed + " tests passed on " + self.nsPath + " (" + time + ") --\n" );
		}
	},

	// Generates log arrays based on current test keys
	_filterLogs: function(){
		var self = this,
			all = [],
			keys = {},
			current = null;

		self._logs.reverse().forEach(function( log ) {
			if ( log instanceof AssertResult ) {
				current = log.name;
				return;
			}

			var name = log[ 0 ];
			if ( log.length > 1 && munit.isString( name ) && self.tests[ name ] ) {
				if ( ! keys[ name ] ) {
					keys[ name ] = [];
				}

				keys[ name ].unshift( log.slice( 1 ) );
			}
			else if ( current && self.tests[ current ] ) {
				if ( ! keys[ current ] ) {
					keys[ current ] = [];
				}

				keys[ current ].unshift( log );
			}
			else {
				all.unshift( log );
			}
		});

		return { all: all, keys: keys };
	},

	// Returns a configured result object
	_addResult: function( name, error, skip ) {
		var self = this,
			now = Date.now(),
			last = ! self.isAsync && self._lastTest ? self._lastTest : self.start,
			result = new AssertResult( name, self.nsPath, now - last, error, skip );

		self.tests[ name ] = result;
		self.list.push( result );
		self._logs.push( result );
		self._lastTest = now;
	},

	// Key matching for object match
	_objectMatch: function( actual, expected, prefix ) {
		var self = this, keys, expectedKeys;
		prefix = prefix || '';

		if ( munit.isArray( actual ) && munit.isArray( expected ) ) {
			if ( actual.length !== expected.length ) {
				throw "\nActual: actual" + prefix + ".length = " + actual.length +
					"\nExpected: expected" + prefix + ".length = " + expected.length;
			}

			munit.each( actual, function( item, i ) {
				if ( munit.isArray( item ) || munit.isObject( item ) ) {
					self._objectMatch( item, expected[ i ], prefix + "[" + i + "]" );
				}
				else if ( item !== expected[ i ] ) {
					throw "\nActual: actual" + prefix + "[" + i + "] = " + item +
						"\nExpected: expected" + prefix + "[" + i + "] = " + expected[ i ];
				}
			});
		}
		else if ( munit.isObject( actual ) && munit.isObject( expected ) ) {
			keys = Object.keys( actual );
			expectedKeys = Object.keys( expected );

			if ( keys.length !== expectedKeys.length ) {
				throw "\nActual: actual" + prefix + ".length = " + keys.length +
					"\nExpected: expected" + prefix + ".length = " + expectedKeys.length;
			}

			munit.each( keys, function( key ) {
				var item = actual[ key ];

				if ( munit.isArray( item ) || munit.isObject( item ) ) {
					self._objectMatch( item, expected[ key ], prefix + "[" + key + "]" );
				}
				else if ( item !== expected[ key ] ) {
					throw "\nActual: actual" + prefix + "[" + key + "] = " + item +
						"\nExpected: expected" + prefix + "[" + key + "] = " + expected[ key ];
				}
			});
		}
		else if ( actual !== expected ) {
			throw "\nActual: actual" + prefix + " = " + actual +
				"\nExpected: expected" + prefix + " = " + expected;
		}
	},

	// Utility for error object matching
	_errorMatch: function( e, match ) {
		var result = { passed: false }, message = '';

		// Get a string for matching on the error
		if ( munit.isError( e ) ) {
			message = e.message;
		}
		else if ( munit.isString( e ) ) {
			message = e;
		}

		// No match required
		if ( match === undefined ) {
			result.passed = true;
		}
		// Non Error/String error object, string matching required
		else if ( ! munit.isError( e ) && ! munit.isString( e ) ) {
			if ( e === match ) {
				result.passed = true;
			}
			else {
				result.extra = "Match object '" + match + "' does not match error '" + e + "'";
			}
		}
		// Function error class matching
		else if ( munit.isFunction( match ) ) {
			if ( e instanceof match ) {
				result.passed = true;
			}
			else {
				result.extra = "Error does not match class '" + match.name + "'";
			}
		}
		// Regex checking on the error message
		else if ( munit.isRegExp( match ) ) {
			if ( match.exec( message ) ) {
				result.passed = true;
			}
			else {
				result.extra = "Regex (" + match + ") could not find match on:\n" + message;
			}
		}
		// String matching on the error message
		else if ( munit.isString( match ) ) {
			if ( match === message ) {
				result.passed = true;
			}
			else {
				result.extra = "Error message doesn't match:\nActual: " + message + "\nExpected: " + match;
			}
		}
		// Unkown error type passed
		else {
			result.extra = "Unknown error match type '" + match + "'";
		}

		return result;
	},

	// Failed test storage
	_fail: function( name, startFunc, error ) {
		var self = this, result;

		// Assign proper error
		if ( ! error ) {
			error = new munit.AssertionError( "'" + name + "' test failed", startFunc );
		}
		else if ( ! ( error instanceof Error ) ) {
			error = new munit.AssertionError( error, startFunc );
		}

		// Increment error count and jump
		self._addResult( name, error );
		self.failed++;
		self.count++;
		munit.failed++;

		// Kill on test failure
		if ( self.options.stopOnFail ) {
			self._flush();
			munit.exit( 1 );
		}
	},

	// Passed test storage
	_pass: function( name ) {
		var self = this;

		self._addResult( name );
		self.passed++;
		self.count++;
		munit.passed++;
	},

	// Throw a generic error based on the current state
	_stateError: function( startFunc ) {
		var self = this,
			message = self.state === munit.ASSERT_STATE_DEFAULT ? "'" + self.nsPath + "' hasn't been triggered yet" :
				self.state === munit.ASSERT_STATE_SETUP ? "'" + self.nsPath + "' is in the setup processs" :
				self.state === munit.ASSERT_STATE_ACTIVE ? "'" + self.nsPath + "' is active" :
				self.state === munit.ASSERT_STATE_TEARDOWN ? "'" + self.nsPath + "' is in the teardown processs" :
				self.state === munit.ASSERT_STATE_CLOSED ? "'" + self.nsPath + "' is closed" :
				self.state === munit.ASSERT_STATE_FINISHED ? "'" + self.nsPath + "' is finished" :
				"'" + self.nsPath + "' is in an unknown state";

		throw new munit.AssertionError( message, startFunc || self._stateError );
	},

	// Throws an error if module isn't in the required state
	requireState: function( required, startFunc ) {
		var self = this;

		if ( required !== self.state ) {
			self._stateError( startFunc || self.requireState );
		}

		return self;
	},

	// Maximum state requirement
	requireMaxState: function( max, startFunc ) {
		var self = this;

		if ( max < self.state ) {
			self._stateError( startFunc || self.requireMaxState );
		}

		return self;
	},

	// Minimum state requirement
	requireMinState: function( min, startFunc ) {
		var self = this;

		if ( min > self.state ) {
			self._stateError( startFunc || self.requireMinState );
		}

		return self;
	},

	// Function spies
	spy: function( object, method, options ) {
		var self = this, spy;

		// Can only create spies while the module is active
		self.requireMaxState( munit.ASSERT_STATE_ACTIVE );

		// Store the spy internally for destruction once module is closed
		spy = munit.Spy( self, object, method, options );
		self._spies.push( spy );

		return spy;
	},

	// Skipped tests
	skip: function( name, reason ) {
		var self = this, result;

		// Require an active state for tests
		self.requireState( munit.ASSERT_STATE_ACTIVE, self.skip );

		// Require a name
		if ( ! munit.isString( name ) ) {
			throw new munit.AssertionError(
				"Skip name not provided on '" + self.nsPath + "'",
				self.skip
			);
		}
		// Require a reason
		else if ( ! munit.isString( reason ) ) {
			throw new munit.AssertionError(
				"Skip reason not provided on '" + self.nsPath + "'",
				self.skip
			);
		}
		// Prevent duplicate tests
		else if ( self.tests[ name ] ) {
			throw new munit.AssertionError(
				"Duplicate Test '" + name + "' on '" + self.nsPath + "'",
				self.skip
			);
		}

		self._addResult( name, null, reason );
		self.skipped++;
		self.count++;
		munit.skipped++;

		return self;
	},

	// Basic boolean test
	ok: function( name, test, startFunc, extra ) {
		var self = this;

		// Require an active state for tests
		self.requireState( munit.ASSERT_STATE_ACTIVE, startFunc || self.ok );

		// Prevent non empty string names
		if ( ! munit.isString( name ) || ! name.length ) {
			throw new munit.AssertionError(
				"Name not found for test on '" + self.nsPath + "'",
				startFunc || self.ok
			);
		}
		// Prevent duplicate tests
		else if ( self.tests[ name ] ) {
			throw new munit.AssertionError(
				"Duplicate Test '" + name + "' on '" + self.nsPath + "'",
				startFunc || self.ok
			);
		}

		// Increment test count and mark it
		self[ !!( test ) ? '_pass' : '_fail' ]( name, startFunc || self.ok, extra );
		
		// Reached expected number of tests, close off
		if ( self.options.expect > 0 && self.count >= self.options.expect ) {
			self.close();
		}

		return self;
	},

	// Shortcut for explicit passed tests
	pass: function( name, startFunc ) {
		return this.ok( name, true, startFunc || this.pass );
	},

	// Shortcut for explicit failures
	fail: function( name, startFunc, extra ) {
		if ( extra === undefined && ! munit.isFunction( startFunc ) ) {
			extra = startFunc;
			startFunc = undefined;
		}

		if ( munit.isError( extra ) ) {
			extra = extra.message;
		}

		return this.ok( name, false, startFunc || this.fail, extra );
	},

	// Testing value for true
	isTrue: function( name, value ) {
		return this.ok( name, value === true, this.isTrue, 'Value is not True' );
	},

	// Testing value for false
	isFalse: function( name, value ) {
		return this.ok( name, value === false, this.isFalse, 'Value is not False' );
	},

	// Testing value for undefined
	isUndefined: function( name, value ) {
		return this.ok( name, value === undefined, this.isUndefined, 'Value is not Undefined' );
	},

	// Testing value for null
	isNull: function( name, value ) {
		return this.ok( name, value === null, this.isNull, 'Value is not Null' );
	},

	// Testing value for Boolean object
	isBoolean: function( name, value ) {
		return this.ok( name, munit.isBoolean( value ), this.isBoolean, 'Value is not a Boolean' );
	},

	// Testing value for Number object
	isNumber: function( name, value ) {
		return this.ok( name, munit.isNumber( value ), this.isNumber, 'Value is not a Number' );
	},

	// Testing value for String object
	isString: function( name, value ) {
		return this.ok( name, munit.isString( value ), this.isString, 'Value is not a String' );
	},

	// Testing value for function
	isFunction: function( name, value ) {
		return this.ok( name, munit.isFunction( value ), this.isFunction, 'Value is not a Function' );
	},

	// Testing value for Array object
	isArray: function( name, value ) {
		return this.ok( name, munit.isArray( value ), this.isArray, 'Value is not an Array' );
	},

	// Testing value for Date object
	isDate: function( name, value ) {
		return this.ok( name, munit.isDate( value ), this.isDate, 'Value is not a Date' );
	},

	// Testing value for RegExp object
	isRegExp: function( name, value ) {
		return this.ok( name, munit.isRegExp( value ), this.isRegExp, 'Value is not a RegExp' );
	},

	// Testing value for Object
	isObject: function( name, value ) {
		return this.ok( name, munit.isObject( value ), this.isObject, 'Value is not an Object' );
	},

	// Testing value for Error object
	isError: function( name, value, match ) {
		var self = this,
			result = munit.isError( value ) ?
				self._errorMatch( value, match ) :
				{ passed: false, extra: "Value is not an Error '" + value + "'" };

		return self.ok( name, result.passed, self.isError, result.extra );
	},

	// Testing if value exists (non null/undefined)
	exists: function( name, value ) {
		return this.ok( name, value !== null && value !== undefined, this.exists, 'Value does not exist' );
	},

	// Testing if the value is null or undefined
	empty: function( name, value ) {
		return this.ok( name, value === null || value === undefined, this.empty, 'Value is not empty' );
	},

	// Strict comparison
	equal: function( name, actual, expected ) {
		return this.ok( name, actual === expected, this.equal, "\nValues should match\nActual:" + actual + "\nExpected:" + expected );
	},

	// Strict un-comparison
	notEqual: function( name, actual, expected ) {
		return this.ok( name, actual !== expected, this.notEqual, "\nValues should not match\nActual:" + actual + "\nExpected:" + expected );
	},

	// Greater than comparison
	greaterThan: function( name, upper, lower ) {
		return this.ok( name, upper > lower, this.greaterThan, "\nUpper Value '" + upper + "' is not greater than lower value '" + lower + "'" );
	},

	// Less than comparison
	lessThan: function( name, lower, upper ) {
		return this.ok( name, lower < upper, this.lessThan, "\nLower Value '" + lower + "' is not less than upper value '" + upper + "'" );
	},

	// Value between boundary
	between: function( name, value, lower, upper ) {
		return this.ok(
			name,
			value > lower && value < upper,
			this.between,
			"\nValue '" + value + "' is not inbetween '" + lower + "' and '" + upper + "'"
		);
	},

	// Deep equal handle
	deepEqual: function( name, actual, expected ) {
		var self = this, passed = true, extra = '';

		try {
			self._objectMatch( actual, expected );
		}
		catch ( e ) {
			passed = false;
			extra = e;

			if ( ! munit.isString( e ) ) {
				throw e;
			}
		}
		
		return self.ok( name, passed, self.deepEqual, extra );
	},

	// Not deep equal handle
	notDeepEqual: function( name, actual, expected ) {
		var self = this, passed = true;

		try {
			self._objectMatch( actual, expected );
			passed = false;
		}
		catch ( e ) {
		}
		
		return self.ok( name, passed, self.notDeepEqual, 'Objects are not supposed to match' );
	},

	// Run internal throw handle
	throws: function( name, match, block ) {
		var self = this, result = { passed: false, extra: 'Block did not throw error' };

		// Variable arguments
		if ( block === undefined && munit.isFunction( match ) ) {
			block = match;
			match = undefined;
		}

		// Fail quick if block isn't a function
		if ( ! munit.isFunction( block ) ) {
			throw new Error( "Block passed to assert.throws is not a function: '" + block + "'" );
		}

		// test for throwing
		try {
			block();
		}
		catch ( e ) {
			result = self._errorMatch( e, match );
		}

		return self.ok( name, result.passed, self.throws, result.extra );
	},

	// Run internal notThrow handle
	doesNotThrow: function( name, block ) {
		var self = this, passed = true;

		try {
			block();
		}
		catch ( e ) {
			passed = false;
		}

		return self.ok( name, passed, self.doesNotThrow, 'Block does throw error' );
	},

	// Matching date objects
	dateEquals: function( name, actual, expected ) {
		var self = this,
			passed = false,
			message = '';

		if ( munit.isDate( actual ) && munit.isDate( expected ) ) {
			passed = actual.getTime() === expected.getTime();
			message = "Date '" + actual + "' does not match '" + expected + "'";
		}
		else {
			message = munit.isDate( actual ) ?
				"Expected value is not a Date object '" + expected + "'" :
				"Actual value is not a Date object '" + actual + "'";
		}

		return self.ok( name, passed, self.dateEquals, message );
	},

	// Tests date is after another date
	dateAfter: function( name, actual, lower ) {
		var self = this,
			passed = false,
			message = '';

		if ( munit.isDate( actual ) && munit.isDate( lower ) ) {
			passed = actual.getTime() > lower.getTime();
			message = "Date '" + actual + "' is not after '" + lower + "'";
		}
		else {
			message = munit.isDate( actual ) ?
				"Lower value is not a Date object '" + lower + "'" :
				"Actual value is not a Date object '" + actual + "'";
		}

		return self.ok( name, passed, self.dateAfter, message );
	},

	// Tests date is before another date
	dateBefore: function( name, actual, upper ) {
		var self = this,
			passed = false,
			message = '';

		if ( munit.isDate( actual ) && munit.isDate( upper ) ) {
			passed = actual.getTime() < upper.getTime();
			message = "Date '" + actual + "' is not before '" + upper + "'";
		}
		else {
			message = munit.isDate( actual ) ?
				"Upper value is not a Date object '" + upper + "'" :
				"Actual value is not a Date object '" + actual + "'";
		}

		return self.ok( name, passed, self.dateBefore, message );
	},

	// Tests date is between two other dates
	dateBetween: function( name, actual, lower, upper ) {
		var self = this,
			passed = false,
			message = '';

		if ( munit.isDate( actual ) && munit.isDate( lower ) && munit.isDate( upper ) ) {
			passed = actual.getTime() > lower.getTime() && actual.getTime() < upper.getTime();
			message = "Date '" + actual + "' is not between '" + lower + "' and '" + upper + "'";
		}
		else {
			message = ! munit.isDate( actual ) ? "Actual value is not a Date object '" + actual + "'" :
				! munit.isDate( lower ) ? "Lower value is not a Date object '" + lower + "'" :
				"Upper value is not a Date object '" + upper + "'";
		}

		return self.ok( name, passed, self.dateBetween, message );
	},

	// Checks to see if object is an instance of klass
	isClass: function( name, object, klass ) {
		this.ok( name, object instanceof klass, this.isClass, "Object is not an instance of '" + klass + "'" );
	},

	// Checks to see if object is of type
	isType: function( name, object, type ) {
		this.ok( name, typeof object == type, this.isType, "Object is not a type of '" + type + "'" );
	},

	// Attaches logs [to specific tests]
	log: function(){
		var self = this;

		// Only allow logs to be added when in setup, active, or teardown states
		self.requireMinState( munit.ASSERT_STATE_SETUP, self.log );
		self.requireMaxState( munit.ASSERT_STATE_TEARDOWN, self.log );

		// Just push all arguments onto the stack for later evaluation
		self._logs.push( Slice.call( arguments ) );

		return self;
	},

	// Extending module
	module: function( name, options, callback ) {
		var self = this;

		// Can only create sub modules if this modules isn't finished
		self.requireMaxState( munit.ASSERT_STATE_ACTIVE, self.module );

		// Module creation is done on the main object (pass this modules prefix path)
		return munit._module( name, options, callback, { nsprefix: self.nsPath } );
	},

	// Custom test additions
	custom: function( name, handle ) {
		var self = this;

		// Can only add custom assertions when module hasn't been triggered yet
		self.requireMaxState( munit.ASSERT_STATE_DEFAULT, self.custom );

		// Block on reserved words
		if ( munit.customReserved.indexOf( name ) > -1 ) {
			throw new Error( "'" + name + "' is a reserved name and cannot be added as a custom assertion test" );
		}

		// Attach handle to assertion module and all submodules
		self[ name ] = handle;
		munit.each( self.ns, function( mod ) {
			mod.custom( name, handle );
		});

		return self;
	},

	// Option getter/setter
	option: function( name, value ) {
		var self = this;

		// Passing a list of options to change
		if ( munit.isObject( name ) ) {
			munit.each( name, function( value, name ) {
				self.option( name, value );
			});

			return self;
		}
		// Requesting to get the value of an option
		else if ( value === undefined ) {
			return self.options[ name ];
		}

		// Disallow changing of options past the active state
		// This will help inform devs of why their options don't work
		self.requireMaxState( munit.ASSERT_STATE_ACTIVE, self.option );

		// Extra error handling for setup option
		// Again, prevents nothing internaly, just to help devs
		if ( name == 'setup' && self.state !== munit.ASSERT_STATE_DEFAULT ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is already past the setup phase, can't change the setup option",
				self.option
			);
		}

		self.options[ name ] = value;
		return self;
	},

	// Module setup
	_setup: function( callback ) {
		var self = this;

		// Can only setup a non-active module
		self.requireState( munit.ASSERT_STATE_DEFAULT, self._setup );

		// Switch state
		self.state = munit.ASSERT_STATE_SETUP;

		// Custom Setup
		if ( self.options.setup ) {
			self.options.setup( self, function setupCallback( e ) {
				// Added precaution
				self.requireState( munit.ASSERT_STATE_SETUP, setupCallback );

				// Flip the state and continue down the trigger path
				self.state = munit.ASSERT_STATE_ACTIVE;
				callback( e, setupCallback );
			});
		}
		else {
			self.state = munit.ASSERT_STATE_ACTIVE;
			callback();
		}

		return self;
	},

	// Module teardown
	_teardown: function( callback ) {
		var self = this;

		// Can only teardown an active module
		self.requireState( munit.ASSERT_STATE_ACTIVE, self._teardown );

		// Switch state
		self.state = munit.ASSERT_STATE_TEARDOWN;

		// Custom teardown
		if ( self.options.teardown ) {
			self.options.teardown( self, function teardownCallback( e ) {
				// Added precaution
				self.requireState( munit.ASSERT_STATE_TEARDOWN, teardownCallback );

				// Flip the state and continue down the close path
				self.state = munit.ASSERT_STATE_CLOSED;
				callback( e, teardownCallback );
			});
		}
		else {
			self.state = munit.ASSERT_STATE_CLOSED;
			callback();
		}

		return self;
	},

	// Trigger module's tests
	trigger: function(){
		var self = this;

		// Can only start a module that hasn't been started yet
		self.requireState( munit.ASSERT_STATE_DEFAULT, self.trigger );

		// Setup and trigger module
		self.start = self.end = Date.now();

		// Parent namespaces sometimes don't have tests
		// Also close out paths that aren't part of the focus
		if ( ! self.callback || ! munit.render.focusPath( self.nsPath ) ) {
			self.state = munit.ASSERT_STATE_CLOSED;
			return self._close();
		}

		// Trigger test setup first
		self._setup(function( e, setupCallback ) {
			if ( e ) {
				self.fail( "[munit] Failed to setup '" + self.nsPath + "' module", setupCallback, e );
				return self.close();
			}

			// Run test
			self.callback( self, self.queue );

			// If module isn't finished, then prove that it's supposed to be asynchronous
			if ( self.state < munit.ASSERT_STATE_TEARDOWN ) {
				// Only tear it down if no timeout is specified
				if ( self.options.timeout < 1 ) {
					self.close();
				}
				// Delayed close
				else {
					self.isAsync = true;
					self._timeid = setTimeout(function(){
						if ( self.state < munit.ASSERT_STATE_TEARDOWN ) {
							self.close();
						}
					}, self.options.timeout);
				}
			}
		});

		return self;
	},

	// Returns XML result format
	junit: function(){
		var self = this,
			nodeVersion = process.version.replace( /\./g, '_' ),
			xml = "<testsuite name='" + munit._xmlEncode( nodeVersion + self.nsPath ) + "' tests='" + self.count + "' failures='" + self.failed + "' skipped='" + self.skipped + "' time='" + ( ( self.end - self.start ) / 1000 ) + "'>";

		self.list.forEach(function( result ) {
			xml += result.junit();
		});
		
		xml += "</testsuite>";
		return xml;
	},

	// JSON result format
	toJSON: function(){
		var self = this;

		return {
			name: self.nsPath.split( '.' ).pop(),
			nsPath: self.nsPath,
			count: self.count,
			passed: self.passed,
			failed: self.failed,
			skipped: self.skipped,
			start: self.start,
			end: self.end,
			time: self.end - self.start,
			tests: self.list,
			ns: self.ns,
		};
	},

	// Forcing close of module
	close: function( startFunc, forced ) {
		var self = this, i, mod;

		// Can only close an active module
		self.requireState( munit.ASSERT_STATE_ACTIVE, self.close );

		// Add fail marker if no tests were ran
		if ( self.count < 1 ) {
			self.fail( "[munit] No tests ran in this module" );
		}

		// Auto close out any spies
		self._spies.reverse().forEach(function( spy ) {
			spy.restore();
		});

		// Proxy teardown to pass start function and forced state
		self._teardown(function( e, teardownCallback ) {
			if ( e ) {
				self._fail( "[munit] failed to teardown '" + self.nsPath + "' module properly", teardownCallback );
			}

			self._close( startFunc || self.close, forced );
		});

		return self;
	},

	// Closing of module after teardown process
	_close: function( startFunc, forced ) {
		var self = this, i, mod;

		// Handle invalid number of tests ran
		if ( self.options.expect > 0 && self.count < self.options.expect && munit.render.focusPath( self.nsPath ) ) {
			self._fail(
				'[munit] Unexpected End',
				startFunc || self._close,
				'Expecting ' + self.options.expect + ' tests, only ' + self.count + ' ran.'
			);
		}
		else if ( self.count < 1 && self.callback && munit.render.focusPath( self.nsPath ) ) {
			self._fail(
				"[munit] No Tests Found",
				startFunc || self._close,
				"Module closed without any tests being ran."
			);
		}

		// Remove timer
		if ( self._timeid ) {
			self._timeid = clearTimeout( self._timeid );
		}

		// Meta
		self.end = Date.now();

		// Readd the queue back to the stack
		if ( self.options.autoQueue && self.queue ) {
			munit.queue.add( self.queue );
			self.queue = null;
		}

		// Check to see if submodules have closed off yet
		for ( i in self.ns ) {
			mod = self.ns[ i ];

			if ( mod.state < munit.ASSERT_STATE_CLOSED ) {
				// Force close them if needed
				if ( forced ) {
					mod.close( startFunc || self._close, forced );
				}
				else {
					return self;
				}
			}
		}

		// All submodules have closed off, can mark this one as finished
		return self.finish( startFunc, forced );
	},

	// Finish this module and all sub modules
	finish: function( startFunc, forced ) {
		var self = this, i, mod;

		// Can only finish an module that's in a closed state
		self.requireState( munit.ASSERT_STATE_CLOSED, startFunc || self.finish );

		// Flip state to finished
		self.state = munit.ASSERT_STATE_FINISHED;

		// Force close each submodule if necessary
		for ( i in self.ns ) {
			mod = self.ns[ i ];

			if ( mod.state < munit.ASSERT_STATE_CLOSED ) {
				mod.close( startFunc || self.finish, true );
			}
		}

		// Only print out results if on the focus path
		if ( munit.render.focusPath( self.nsPath ) ) {
			self._flush();
		}

		// Finish parent if not forced by it
		if ( ! forced ) {
			if ( self.parAssert ) {
				if ( self.parAssert.state < munit.ASSERT_STATE_CLOSED ) {
					munit.render.check();
					return self;
				}

				for ( i in self.parAssert.ns ) {
					mod = self.parAssert.ns[ i ];

					if ( mod.state < munit.ASSERT_STATE_FINISHED ) {
						munit.render.check();
						return self;
					}
				}

				self.parAssert.finish();
			}
			else {
				munit.render.check();
			}
		}

		return self;
	}

};


// Assertion Result
function AssertResult( name, ns, time, error, skip ) {
	var self = this;

	if ( ! ( self instanceof AssertResult ) ) {
		return new AssertResult( name, ns, time, error );
	}

	self.name = name || '';
	self.nsPath = ns || '';
	self.ns = self.nsPath + '.' + self.name;
	self.time = time;
	self.error = error;
	self.skip = skip;
}

AssertResult.prototype = {

	junit: function(){
		var self = this,
			nodeVersion = process.version.replace( /\./g, '_' ),
			message = self._encodeMessage();

		return "<testcase name='" + munit._xmlEncode( self.name ) + "' classname='" + munit._xmlEncode( nodeVersion + self.nsPath ) + "' time='" + ( self.time / 1000 ) + "'>" + message + "</testcase>";
	},

	toJSON: function(){
		var self = this;

		return {
			name: self.name,
			nsPath: self.nsPath,
			time: self.time,
			error: self.error || undefined,
			trace: self.error ? self.error.stack : undefined,
			skip: self.skip
		};
	},

	_encodeMessage: function(){
		var self = this,
			error = self.error,
			skip = self.skip;

		if ( error ) {
			return "<failure message=\"" + munit._xmlEncode( error.message ) + "\">" + munit._xmlEncode( error.stack ) + "</failure>";
		}
		else if ( skip ) {
			return "<skipped message=\"" + munit._xmlEncode( skip ) + "\"></skipped>";
		}
		else {
			return "";
		}
	}

};


munit.Assert = Assert;
munit.AssertResult = AssertResult;
