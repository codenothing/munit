var munit = global.munit,
	util = require( 'util' ),
	Slice = Array.prototype.slice,
	_added = 0,
	ramp = /\&/g,
	rgt = />/g,
	rlt = /</g,
	rquote = /"/g,
	rsquote = /'/g,
	encode = function( string ) {
		return ( string || '' ).replace( ramp, "&amp;" )
			.replace( rgt, "&gt;" )
			.replace( rlt, "&lt;" )
			.replace( rquote, "&quot;" )
			.replace( rsquote, "&apos;" );
	};

function Assert( nsPath, parAssert, options, callback ) {
	var self = this;

	if ( ! ( self instanceof Assert ) ) {
		return new Assert( nsPath, parAssert, options, callback );
	}
	else if ( callback === undefined && munit.isFunction( options ) ) {
		callback = options;
		options = null;
	}

	// Attach events to object
	munit._event( self );

	// Setup
	self.nsPath = nsPath;
	self.parAssert = parAssert;
	self.options = options || {};
	self.list = [];
	self.tests = {};
	self.ns = {};
	self.count = 0;
	self.passed = 0;
	self.failed = 0;
	self.callback = callback;
	self.queue = null;
	self.start = 0;
	self.end = 0;
	self.isAsync = false;
	self._added = ++_added;
	self._closed = false;
	self._finished = false;
	self._timeid = null;
	self._logs = [];
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
	_assertResult: function( name, error ) {
		var self = this,
			now = Date.now(),
			last = ! self.isAsync && self._lastTest ? self._lastTest : self.start;

		self._lastTest = now;
		return new AssertResult( name, self.nsPath, now - last, error );
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
			error = new munit.AssertionError( name + ' test failed', startFunc );
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
			process.exit( 1 );
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

	// Basic boolean test
	ok: function( name, test, startFunc, extra ) {
		var self = this;

		// Force string name
		name = name + '';

		// Block tests from occuring after module is closed
		if ( self._closed ) {
			throw new munit.AssertionError(
				"'" + self.nsPath + "' already closed",
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
		this._logs.push( Slice.call( arguments ) );
	},

	// Extending module
	module: function( name, options, callback ) {
		return munit( this.nsPath + '.' + name, options, callback );
	},

	// Custom test additions
	custom: function( name, handle ) {
		var self = this;

		if ( munit.customReserved.indexOf( name ) > -1 ) {
			throw new Error( "'" + name + "' is a reserved name and cannot be added as a custom assertion test" );
		}

		// Attach handle to assertion module and all submodules
		self[ name ] = handle;
		munit.each( self.ns, function( mod ) {
			mod.custom( name, handle );
		});
	},

	// Trigger module's tests
	trigger: function(){
		var self = this;

		// Setup and trigger module
		self.start = self.end = Date.now();

		// Queued modules get the object first
		if ( self.queue ) {
			self.callback( self.queue, self );
		}
		else {
			self.callback( self );
		}

		// If module isn't finished, then prove that it's supposed to be asynchronous
		if ( ! self._closed ) {
			// No limit on expected tests, assume synchronous
			// And if timeout is explicetely null'd out, assume synchronous
			if ( ! self.options.expect || ! self.options.timeout ) {
				self.close();
			}
			// Attach timeout while the module is running
			else {
				self.isAsync = true;
				self._timeid = setTimeout(function(){
					if ( ! self._closed ) {
						self.close();
					}
				}, self.options.timeout);
			}
		}
	},

	// Returns XML result format
	junit: function(){
		var self = this,
			prefix = munit._options.junitPrefix ? munit._options.junitPrefix + '.' : '',
			xml = "<testsuite name='" + munit._xmlEncode( prefix + self.nsPath ) + "' tests='" + self.count + "' failures='" + self.failed + "' time='" + ( ( self.end - self.start ) / 1000 ) + "'>";

		self.list.forEach(function( result ) {
			xml += result.junit();
		});
		
		xml += "</testsuite>";
		return xml;
	},

	// Forcing close of module
	close: function( startFunc, forced ) {
		var self = this, i, mod;

		// Strictly prevent double closures
		if ( self._closed ) {
			throw new munit.AssertionError(
				self.nsPath + ' is already closed',
				startFunc
			);
		}

		// Handle invalid number of tests ran
		if ( self.options.expect > 0 && self.count < self.options.expect ) {
			self._fail(
				'Unexpected End',
				startFunc || self.close,
				'Expecting ' + self.options.expect + ' synchronous tests, only ' + self.count + ' ran.'
			);
		}

		// Remove timer
		if ( self._timeid ) {
			self._timeid = clearTimeout( self._timeid );
		}

		// Meta
		self._closed = true;
		self.end = Date.now();
		self.emit( 'close' );

		// Readd the queue back to the stack
		if ( self.options.autoQueue && self.queue ) {
			munit.queue.add( self.queue );
			self.queue = null;
		}

		// Check to see if submodules have closed off yet
		for ( i in self.ns ) {
			mod = self.ns[ i ];

			if ( ! mod._closed ) {
				// Force close them if needed
				if ( forced ) {
					mode.close( startFunc, forced );
				}

				return;
			}
		}

		// All submodules have closed off, can mark this one as finished
		return self.finish( startFunc, forced );
	},

	// Finish this module and all sub modules
	finish: function( startFunc, forced ) {
		var self = this, i, mod;

		// Strictly prevent double finishes
		if ( self._finished ) {
			throw new munit.AssertionError(
				self.nsPath + " and it's submodules have already finished",
				startFunc
			);
		}

		// Meta
		self._finished = true;
		self.emit( 'finish' );

		// Force close each submodule if necessary
		for ( i in self.ns ) {
			mod = self.ns[ i ];

			if ( ! mod._closed ) {
				mod.close( startFunc, true );
			}
		}

		// Print out the results
		self._flush();

		// Finish parent if not forced by it
		if ( ! forced ) {
			if ( self.parAssert ) {
				if ( ! self.parAssert._closed ) {
					return self;
				}

				for ( i in self.parAssert.ns ) {
					mod = self.parAssert.ns[ i ];

					if ( ! mod._finished ) {
						return self;
					}
				}

				self.parAssert.finish();
				return self;
			}
			else {
				munit.render.check();
			}
		}

		return self;
	}

};


// Assertion Result
function AssertResult( name, ns, time, error ) {
	var self = this;

	if ( ! ( self instanceof AssertResult ) ) {
		return new AssertResult( name, ns, time, error );
	}

	self.name = name || '';
	self.nsPath = ns || '';
	self.ns = self.nsPath + '.' + self.name;
	self.time = time;
	self.error = error;
}

AssertResult.prototype = {

	junit: function(){
		var self = this,
			prefix = munit._options.junitPrefix ? munit._options.junitPrefix + '.' : '',
			error = self._encodeError();

		return "<testcase name='" + munit._xmlEncode( self.name ) + "' classname='" + munit._xmlEncode( prefix + self.nsPath ) + "' time='" + ( self.time / 1000 ) + "'>" + error + "</testcase>";
	},

	_encodeError: function(){
		var self = this, error = self.error;

		if ( ! error ) {
			return '';
		}

		return "<failure message=\"" + encode( error.message ) + "\">" + encode( error.stack ) + "</failure>";
	}

};


munit.Assert = Assert;
munit.AssertResult = AssertResult;
