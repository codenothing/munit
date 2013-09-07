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
}

Assert.prototype = {

	// Prints module results to cli
	_flush: function(){
		var self = this,
			logs = self._filterLogs(),
			all = logs.all,
			keys = logs.keys,
			time = munit._relativeTime( self.end - self.start );


		// Logs made against the module
		if ( all.length ) {
			munit.log( "\n\n" );
			all.forEach(function( args ) {
				munit.log.apply( munit, args );
			});
		}

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
			keys = {};

		self._logs.forEach(function( log ) {
			if ( ! munit.isArray( log ) || ! log.length ) {
				return;
			}

			var name = log[ 0 ];
			if ( self.tests[ name ] ) {
				if ( ! keys[ name ] ) {
					keys[ name ] = [];
				}

				keys[ name ].push( log.slice( 1 ) );
			}
			else {
				all.push( log );
			}
		});

		return { all: all, keys: keys };
	},

	// Returns a configured result object
	_assertResult: function( name, error, skip ) {
		var self = this,
			now = Date.now(),
			last = ! self.isAsync && self._lastTest ? self._lastTest : self.start;

		self._lastTest = now;
		return new AssertResult( name, self.nsPath, now - last, error, skip );
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
		result = self._assertResult( name, error );
		munit.failed++;
		self.failed++;
		self.tests[ name ] = result;
		self.list.push( result );

		// Kill on test failure
		if ( self.options.stopOnFail ) {
			self._flush();
			munit.exit( 1 );
		}
	},

	// Passed test storage
	_pass: function( name ) {
		var self = this, result = self._assertResult( name );

		munit.passed++;
		self.passed++;
		self.tests[ name ] = result;
		self.list.push( result );
	},

	// Throw a generic error based on the current state
	_stateError: function( startFunc ) {
		var self = this;

		if ( self.state === munit.ASSERT_STATE_DEFAULT ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' hasn't been triggered yet",
				startFunc || self._stateError
			);
		}
		else if ( self.state === munit.ASSERT_STATE_SETUP ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is in the setup processs",
				startFunc || self._stateError
			);
		}
		else if ( self.state === munit.ASSERT_STATE_ACTIVE ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is active",
				startFunc || self._stateError
			);
		}
		else if ( self.state === munit.ASSERT_STATE_TEARDOWN ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is in the teardown processs",
				startFunc || self._stateError
			);
		}
		else if ( self.state === munit.ASSERT_STATE_CLOSED ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is closed",
				startFunc || self._stateError
			);
		}
		else if ( self.state === munit.ASSERT_STATE_FINISHED ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is finished",
				startFunc || self._stateError
			);
		}
		else {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' is in an unknown state",
				startFunc || self._stateError
			);
		}
	},

	// Throws an error if module isn't in the required state
	requireState: function( required, startFunc ) {
		var self = this;

		if ( required !== self.state ) {
			self._stateError( startFunc );
		}

		return self;
	},

	// Maximum state requirement
	requireMaxState: function( max, startFunc ) {
		var self = this;

		if ( max < self.state ) {
			self._stateError( startFunc );
		}

		return self;
	},

	// Minimum state requirement
	requireMinState: function( min, startFunc ) {
		var self = this;

		if ( min > self.state ) {
			self._stateError( startFunc );
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

		result = self._assertResult( name, null, reason );
		munit.skipped++;
		self.skipped++;
		self.count++;
		self.tests[ name ] = result;
		self.list.push( result );

		return self;
	},

	// Basic boolean test
	ok: function( name, test, startFunc, extra ) {
		var self = this;

		// Require an active state for tests
		self.requireState( munit.ASSERT_STATE_ACTIVE, startFunc || self.ok );

		// Force string name
		name = name + '';

		// Prevent duplicate tests
		if ( self.tests[ name ] ) {
			throw new munit.AssertionError(
				"Duplicate Test '" + name + "' on '" + self.nsPath + "'",
				startFunc || self.ok
			);
		}

		// Increment test count and mark it
		self.count++;
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
		if ( extra === undefined && munit.isString( startFunc ) ) {
			extra = startFunc;
			startFunc = undefined;
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
	isError: function( name, value, klass ) {
		return this.ok( name, munit.isError( value, klass ), this.isError, klass ? 'Value is not an error class of ' + klass.name : 'Value is not an Error' );
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
	throws: function( name, error, block ) {
		var self = this, passed = false, message = '', extra = 'Block did not throw error';

		// Variable arguments
		if ( block === undefined && munit.isFunction( error ) ) {
			block = error;
			error = undefined;
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
			// Get a string for matching on the error
			if ( munit.isError( e ) ) {
				message = e.message;
			}
			else if ( munit.isString( e ) ) {
				message = e;
			}

			// Any error thrown passes with no error checking
			if ( error === undefined ) {
				passed = true;
			}
			// Error thrown has to be an instance of the error passed
			else if ( munit.isFunction( error ) && e instanceof error ) {
				passed = true;
			}
			// Regex checking on the error message
			else if ( munit.isRegExp( error ) ) {
				if ( error.exec( message ) ) {
					passed = true;
				}
				else {
					extra = "Regex (" + error + ") could not find match on:\n" + message;
				}
			}
			// String matching on the error message
			else if ( munit.isString( error ) ) {
				if ( error === message ) {
					passed = true;
				}
				else {
					extra = "Thrown message doesn't match:\nActual: " + message + "\nExpected: " + error;
				}
			}
			// Unkown error type passed
			else {
				throw "Unknown error type passed to assert.throws - '" + error + "'";
			}
		}

		return self.ok( name, passed, self.throws, extra );
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

	// Attaches logs [to specific tests]
	log: function(){
		var self = this;

		// Only allow logs up until the module has been flushed
		self.requireMaxState( munit.ASSERT_STATE_ACTIVE );

		// Just push all arguments onto the stack for later evaluation
		self._logs.push( Slice.call( arguments ) );

		return self;
	},

	// Extending module
	module: function( name, options, callback ) {
		var self = this;

		// Can only create sub modules if this modules isn't finished
		self.requireMaxState( munit.ASSERT_STATE_ACTIVE );

		// Module creation is done on the main object (pass this modules prefix path)
		return munit._module( name, options, callback, { nsprefix: self.nsPath } );
	},

	// Custom test additions
	custom: function( name, handle ) {
		var self = this;

		// Can only add custom assertions when module hasn't been triggered yet
		self.requireMaxState( munit.ASSERT_STATE_DEFAULT );

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
		self.requireState( munit.ASSERT_STATE_DEFAULT );

		// Switch state
		self.state = munit.ASSERT_STATE_SETUP;

		// Custom Setup
		if ( self.options.setup ) {
			self.options.setup( self, function(){
				// Added precaution
				self.requireState( munit.ASSERT_STATE_SETUP );

				// Flip the state and continue down the trigger path
				self.state = munit.ASSERT_STATE_ACTIVE;
				callback();
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
		self.requireState( munit.ASSERT_STATE_ACTIVE );

		// Switch state
		self.state = munit.ASSERT_STATE_TEARDOWN;

		// Custom teardown
		if ( self.options.teardown ) {
			self.options.teardown( self, function(){
				// Added precaution
				self.requireState( munit.ASSERT_STATE_TEARDOWN );

				// Flip the state and continue down the close path
				self.state = munit.ASSERT_STATE_CLOSED;
				callback();
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

		// Setup and trigger module
		self.start = self.end = Date.now();

		// Parent namespaces sometimes don't have tests
		// Also close out paths that aren't part of the focus
		if ( ! self.callback || ! munit.render.focusPath( self.nsPath ) ) {
			self.requireState( munit.ASSERT_STATE_DEFAULT );
			self.state = munit.ASSERT_STATE_CLOSED;
			return self._close();
		}

		// Trigger test setup first
		self._setup(function(){
			// Queued modules get the object first
			if ( self.queue ) {
				self.callback( self.queue, self );
			}
			else {
				self.callback( self );
			}

			// If module isn't finished, then prove that it's supposed to be asynchronous
			if ( self.state < munit.ASSERT_STATE_TEARDOWN ) {
				self.isAsync = !!self.options.isAsync;

				// No limit on expected tests, assume synchronous
				// And if timeout is explicetely null'd out, assume synchronous
				if ( ! self.isAsync && ! self.options.expect ) {
					self.close();
				}
				// Require a timeout for async testing
				else if ( ! munit.isNumber( self.options.timeout ) || self.options.timeout < 1 ) {
					throw new Error( "No timeout specified for async test '" + self.nsPath + "'" );
				}
				// Attach timeout while the module is running
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
		self.requireState( munit.ASSERT_STATE_ACTIVE );

		// Auto close out any spies
		self._spies.reverse().forEach(function( spy ) {
			spy.restore();
		});

		// Proxy teardown to pass start function and forced state
		self._teardown(function(){
			self._close( startFunc, forced );
		});

		return self;
	},

	// Closing of module after teardown process
	_close: function( startFunc, forced ) {
		var self = this, i, mod;

		// Handle invalid number of tests ran
		if ( self.options.expect > 0 && self.count < self.options.expect && munit.render.focusPath( self.nsPath ) ) {
			self._fail(
				'Unexpected End',
				startFunc || self._close,
				'Expecting ' + self.options.expect + ' synchronous tests, only ' + self.count + ' ran.'
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
					mod.close( startFunc, forced );
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
		self.requireState( munit.ASSERT_STATE_CLOSED );

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
					return self;
				}

				for ( i in self.parAssert.ns ) {
					mod = self.parAssert.ns[ i ];

					if ( mod.state < munit.ASSERT_STATE_FINISHED ) {
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
