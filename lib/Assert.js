var MUnit = global.MUnit,
	util = require( 'util' ),
	_Assert = require( 'assert' );

function Assert( nsPath, parAssert, options, callback ) {
	var self = this;

	if ( ! ( self instanceof Assert ) ) {
		return new Assert( options );
	}
	else if ( callback === undefined && MUnit.isFunction( options ) ) {
		callback = options;
		options = null;
	}

	// Attach events to object
	MUnit.Event( self );

	// Setup
	self.nsPath = nsPath;
	self.parAssert = parAssert;
	self.options = options || {};
	self.tests = {};
	self.ns = {};
	self.count = 0;
	self.passed = 0;
	self.failed = 0;
	self.callback = callback;
	self.queue = null;
	self._closed = false;
	self._finished = false;
	self._timeid = null;
}

Assert.prototype = {

	// Prints module results to cli
	_flush: function(){
		var self = this;

		// Root module
		if ( ! self.callback ) {
			MUnit.Color.green( "=== All submodules of " + self.nsPath + " have finished ===" );
			return;
		}

		// Content
		MUnit.Color.blue( "\n" + self.nsPath );
		MUnit.each( self.tests, function( test ) {
			if ( test.error ) {
				MUnit.Color.red( test.ns );
				console.log( "\n", test.error.stack );
				console.log( "\n" );
			}
			else {
				MUnit.Color.green( test.ns );
			}
		});

		// Final Output
		if ( self.failed ) {
			MUnit.Color.red( "\n-- " + self.failed + " tests failed on " + self.nsPath + " --\n" );
		}
		else {
			MUnit.Color.green( "\n-- All " + self.passed + " tests passed on " + self.nsPath + " --\n" );
		}
	},

	// Failed test storage
	_fail: function( name, startFunc, error ) {
		var self = this;

		// Assign proper error
		if ( ! error ) {
			error = new MUnit.AssertionError( name + ' test failed', startFunc );
		}
		else if ( ! ( error instanceof Error ) ) {
			error = new MUnit.AssertionError( error, startFunc );
		}

		// Increment error count and jump
		MUnit.failed++;
		self.failed++;
		self.tests[ name ] = {
			ns: self.nsPath + '.' + name,
			error: error
		};

		// Kill on test failure
		if ( self.options.stopOnFail ) {
			self._flush();
			process.exit( 1 );
		}
	},

	// Passed test storage
	_pass: function( name ) {
		var self = this;

		MUnit.passed++;
		self.passed++;
		self.tests[ name ] = {
			ns: self.nsPath + '.' + name
		};
	},

	// Basic boolean test
	ok: function( name, test, startFunc, extra ) {
		var self = this;

		// Block tests from occuring after module is closed
		if ( self._closed ) {
			throw new MUnit.AssertionError(
				"'" + self.nsPath + "' already closed.",
				startFunc || self.ok
			);
		}
		// Prevent duplicate tests
		else if ( self.tests[ name ] ) {
			throw new MUnit.AssertionError(
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
		return this.ok( name, MUnit.isBoolean( value ), this.isBoolean, 'Value is not a Boolean' );
	},

	// Testing value for Number object
	isNumber: function( name, value ) {
		return this.ok( name, MUnit.isNumber( value ), this.isNumber, 'Value is not a Number' );
	},

	// Testing value for Sumber object
	isString: function( name, value ) {
		return this.ok( name, MUnit.isString( value ), this.isString, 'Value is not a String' );
	},

	// Testing value for function
	isFunction: function( name, value ) {
		return this.ok( name, MUnit.isFunction( value ), this.isFunction, 'Value is not a Function' );
	},

	// Testing value for Array object
	isArray: function( name, value ) {
		return this.ok( name, MUnit.isArray( value ), this.isArray, 'Value is not an Array' );
	},

	// Testing value for Date object
	isDate: function( name, value ) {
		return this.ok( name, MUnit.isDate( value ), this.isDate, 'Value is not a Date' );
	},

	// Testing value for RegExp object
	isRegExp: function( name, value ) {
		return this.ok( name, MUnit.isRegExp( value ), this.isRegExp, 'Value is not a RegExp' );
	},

	// Testing value for Object
	isObject: function( name, value ) {
		return this.ok( name, MUnit.isObject( value ), this.isObject, 'Value is not an Object' );
	},

	// Testing value for Error object
	isError: function( name, value ) {
		return this.ok( name, MUnit.isError( value ), this.isError, 'Value is not an Error' );
	},

	// Testing if value exists (non null/undefined)
	exists: function( name, value ) {
		return this.ok( name, value !== null && value !== undefined, this.exists, 'Value does not exist' );
	},

	// Testing if the value is null or undefined
	empty: function( name, value ) {
		return this.ok( name, value === null || value === undefined, this.exists, 'Value is not empty' );
	},

	// Strict comparison
	equal: function( name, actual, expected ) {
		var self = this;

		if ( actual === expected ) {
			self.pass( name, self.equal );
		}
		else {
			self.fail( name, self.equal, "\nActual:   " + actual + "\nExpected: " + expected );
		}

		return self;
	},

	// Strict un-comparison
	notEqual: function( name, actual, expected ) {
		var self = this;

		if ( actual !== expected ) {
			self.pass( name, self.notEqual );
		}
		else {
			self.fail( name, self.notEqual, "\nActual:   " + actual + "\nExpected: " + expected );
		}

		return self;
	},

	// Deep equal handle
	deepEqual: function( name, actual, expected ) {
		var self = this, passed = true, extra = '';

		try {
			_Assert.deepEqual( actual, expected, name );
		}
		catch ( e ) {
			extra = "\nActual: " + util.inspect( actual, false, null ) +
				"\nExpected: " + util.inspect( expected, false, null );
			passed = false;
		}
		
		return self.ok( name, passed, self.deepEqual, extra );
	},

	// Run internal throw handle
	throws: function( name, error, block ) {
		var self = this, passed = true;

		// Variable arguments
		if ( block === undefined && typeof error == 'function' ) {
			block = error;
			error = undefined;
		}

		try {
			_Assert.throws( block, error, name );
		}
		catch ( e ) {
			passed = false;
		}

		return self.ok( name, passed, self.throws, 'Block did not throw error' );
	},

	// Run internal notThrow handle
	doesNotThrow: function( name, error, block ) {
		var self = this, passed = true;

		// Variable arguments
		if ( block === undefined && typeof error == 'function' ) {
			block = error;
			error = undefined;
		}

		try {
			_Assert.doesNotThrow( block, error, name );
		}
		catch ( e ) {
			passed = false;
		}

		return self.ok( name, passed, self.doesNotThrow, 'Block does throw error' );
	},

	// Extending module
	module: function( name, options, callback ) {
		return MUnit( this.nsPath + '.' + name, options, callback );
	},

	// Forcing close of module
	close: function( startFunc, forced ) {
		var self = this, i, mod;

		// Strictly prevent double closures
		if ( self._closed ) {
			throw new MUnit.AssertionError(
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
		self.emit( 'close' );

		// Readd the queue back to the stack
		if ( self.options.autoQueue && self.queue ) {
			MUnit.Queue.add( self.queue );
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
			throw new MUnit.AssertionError(
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
				MUnit._renderCheck();
			}
		}

		return self;
	}

};


MUnit.Assert = Assert;
