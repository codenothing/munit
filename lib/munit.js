var util = require( 'util' ),
	Slice = Array.prototype.slice,
	toString = Object.prototype.toString,
	TIME_SECOND = 1000,
	TIME_MINUTE = TIME_SECOND * 60,
	TIME_HOUR = TIME_MINUTE * 60,
	TIME_DAY = TIME_HOUR * 24,
	ramp = /\&/g,
	rquote = /"/g,
	rsquote = /'/g,
	rlt = /</g,
	rgt = />/g,
	rpathsplit = /\./g;


// Root just creates assertion module
function munit( name, options, callback ) {
	return munit._module( name, options, callback );
}


// Type tests
"Boolean Number String Function Array Date RegExp Object Error".split(' ').forEach(function( method ) {
	if ( method == 'Array' ) {
		return ( munit.isArray = Array.isArray );
	}
	else if ( method == 'Error' ) {
		munit.isError = function( object, klass ) {
			if ( ! klass ) {
				klass = Error;
			}

			return object && ( object instanceof klass );
		};

		return;
	}

	var match = '[object ' + method + ']';
	munit[ 'is' + method ] = function( object ) {
		return object !== undefined && object !== null && toString.call( object ) == match;
	};
});


// Object extension utility
munit.extend = function(){
	var args = Slice.call( arguments ), i = -1, l = args.length, deep = false, target = this, name, copy;

	// Check for deep copy
	if ( munit.isBoolean( args[ 0 ] ) ) {
		deep = args.shift();
		l = args.length;
	}

	// Check for multi object extension
	if ( l > 1 ) {
		target = args.shift();
		l = args.length;
	}

	for ( ; ++i < l; ) {
		copy = args[ i ];
		for ( name in copy ) {
			if ( deep && copy[ name ] && munit.isArray( copy[ name ] ) ) {
				target[ name ] = munit.extend( deep, target[ name ] || [], copy[ name ] );
			}
			else if ( deep && munit.isObject( copy[ name ] ) ) {
				target[ name ] = munit.extend( deep, target[ name ] || {}, copy[ name ] );
			}
			else {
				target[ name ] = copy[ name ];
			}
		}
	}

	return target;
};


// Attach properties
munit.extend({

	// Setup
	noop: function(){},
	ns: {},
	passed: 0,
	failed: 0,
	skipped: 0,
	tests: [],
	start: 0,
	end: 0,
	_focus: [],

	// Render options
	_options: {
		render: null,
		results: null,
		focus: null
	},

	// Reserved keys for custom assertions
	customReserved: [
		'on',
		'once',
		'emit',
		'removeListener',
		'removeAllListeners',
		'nsPath',
		'parAssert',
		'options',
		'list',
		'tests',
		'ns',
		'count',
		'passed',
		'failed',
		'callback',
		'queue',
		'start',
		'end',
		'isAsync'
	],

	// Priority Defaults
	PRIORITY_HIGHEST: 0.8,
	PRIORITY_HIGHER: 0.7,
	PRIORITY_HIGH: 0.6,
	PRIORITY_DEFAULT: 0.5,
	PRIORITY_LOW: 0.4,
	PRIORITY_LOWER: 0.3,
	PRIORITY_LOWEST: 0.2,

	// Assert States
	ASSERT_STATE_DEFAULT: 0,
	ASSERT_STATE_SETUP: 1,
	ASSERT_STATE_ACTIVE: 2,
	ASSERT_STATE_TEARDOWN: 3,
	ASSERT_STATE_CLOSED: 4,
	ASSERT_STATE_FINISHED: 5,

	// Render States
	RENDER_STATE_DEFAULT: 0,
	RENDER_STATE_READ: 1,
	RENDER_STATE_COMPILE: 2,
	RENDER_STATE_TRIGGER: 3,
	RENDER_STATE_ACTIVE: 4,
	RENDER_STATE_FINISHED: 5,
	RENDER_STATE_COMPLETE: 6,

	// These options don't inherit from parent modules
	_optionReset: [ 'expect', 'queue', 'depends' ],

	// Proxy all logs to the console
	log: console.log.bind( console ),

	// Shortcut for auto-triggering last callback argument
	triggerLast: function(){
		var args = Slice.call( arguments );

		return function(){
			var callback = Slice.call( arguments ).pop();

			if ( munit.isFunction( callback ) ) {
				callback.apply( this, args );
			}
			else {
				throw new Error( "Last argument is not function (munit.triggerLast)" );
			}
		};
	},

	// Iteraction utility
	each: function( items, fn ) {
		var i, l;

		if ( munit.isArray( items ) ) {
			for ( i = -1, l = items.length; ++i < l; ) {
				if ( fn( items[ i ], i, items ) === false ) {
					break;
				}
			}
		}
		else {
			for ( i in items ) {
				if ( fn( items[ i ], i, items ) === false ) {
					break;
				}
			}
		}

		return items;
	},

	// Module creation
	_module: function( name, options, callback, _extra ) {
		_extra = _extra || {};
		var found = false,
			_nsprefix = _extra.nsprefix && _extra.nsprefix.length ? _extra.nsprefix + '.' : '';

		// Clear out extra nsprefix so that _extra is mergable
		if ( _extra.nsprefix ) {
			delete _extra.nsprefix;
		}

		// Drop extra if there are no options to merge
		if ( Object.keys( _extra ).length < 1 ) {
			_extra = undefined;
		}

		// Pure getter
		if ( munit.render.state > munit.RENDER_STATE_READ && munit.isString( name ) && options === undefined && callback === undefined ) {
			return munit._getModule( _nsprefix + name );
		}

		// Can only add modules when in a non compile state
		munit.render.requireMaxState( munit.RENDER_STATE_READ, munit._module );

		// munit( [ module objects ] );
		if ( munit.isArray( name ) ) {
			return munit.each( name, function( object ) {
				munit._module(
					_nsprefix + object.name,
					object.options,
					object.callback,
					_extra
				);
			});
		}
		// munit({ modules });
		else if ( munit.isObject( name ) && options === undefined ) {
			return munit.each( name, function( callback, key ) {
				munit._module( _nsprefix + key, undefined, callback, _extra );
			});
		}
		// munit({ options }, { modules });
		else if ( munit.isObject( name ) && munit.isObject( options ) ) {
			return munit.each( options, function( callback, sub ) {
				munit._module( _nsprefix + sub, name, callback, _extra );
			});
		}
		// munit( name, { options }, { modules });
		else if ( munit.isObject( options ) && munit.isObject( callback ) ) {
			return munit.each( callback, function( callback, sub ) {
				munit._module( _nsprefix + name + '.' + sub, options, callback, _extra );
			});
		}
		// Test for object of options/modules
		else if ( munit.isObject( options ) && callback === undefined ) {
			// Test for any key that doesn't exist on defaults
			found = false;
			Object.keys( options ).forEach(function( key ) {
				if ( ! munit.defaults.settings.hasOwnProperty( key ) ) {
					found = true;
				}
			});

			// 'options' is an object of modules
			if ( found ) {
				return munit.each( options, function( callback, sub ) {
					munit._module( _nsprefix + name + '.' + sub, undefined, callback, _extra );
				});
			}

			// Reset callback into undefined state
			callback = undefined;
		}
		// munit( name, callback )
		else if ( callback === undefined && munit.isFunction( options ) ) {
			callback = options;
			options = undefined;
		}
		// munit( name, 10, callback ) ...expected tests as options
		else if ( munit.isNumber( options ) ) {
			options = { expect: options };
		}

		// Pass along to internal module creation
		return munit._createModule(
			_nsprefix + name,
			munit.extend( true, {}, options || {}, _extra || {} ),
			callback
		);
	},

	// Gets module on path
	_getModule: function( path ) {
		var parts = path.split( rpathsplit ), ns = munit.ns, assert;

		// Grep for nested path module
		munit.each( parts, function( part ) {
			if ( assert = ns[ part ] ) {
				ns = assert.ns;
			}
			else {
				throw new munit.AssertionError( "Module path not found '" + path + "'", munit._getModule );
			}
		});

		return assert;
	},

	// Internal module creation
	_createModule: function( name, options, callback ) {
		var ns = munit.ns,
			parts = name.split( rpathsplit ),
			finalPart = parts.pop(),
			opts = munit.extend( true, {}, munit.defaults.settings ),
			reset = {},
			assert = null,
			path = '';

		// Setup option reset based on default values
		munit._optionReset.forEach(function( key ) {
			reset[ key ] = munit.defaults.settings[ key ];
		});

		// Filter through all parents
		parts.forEach(function( mod ) {
			// Update the path
			if ( path.length ) {
				path += '.';
			}
			path += mod;

			// Assign assert module
			if ( ! ns[ mod ] ) {
				assert = ns[ mod ] = new munit.Assert( path, assert, opts );
			}

			// Trickle down the path
			assert = ns[ mod ];
			ns = assert.ns;
			opts = munit.extend( true, {}, opts, reset, assert.options );
		});

		// Module already exists, update it
		if ( ns[ finalPart ] ) {
			assert = ns[ finalPart ];

			// Test module is already in use, code setup is wrong
			if ( assert.callback ) {
				throw new munit.AssertionError( "'" + name + "' module has already been created", munit._createModule );
			}
			
			assert.options = munit.extend( true, {}, opts, reset, options );
			assert.callback = callback;
		}
		else {
			options = munit.extend( true, {}, opts, reset, options );
			assert = ns[ finalPart ] = new munit.Assert( name, assert, options, callback );
		}

		// Return the assertion module for use
		return assert;
	},

	// Creating async module
	async: function( name, options, callback ) {
		return munit._module( name, options, callback, { isAsync: true } );
	},

	// Creating module with dependencies
	depends: function( name, depends, callback ) {
		if ( ( ! munit.isString( depends ) && ! munit.isArray( depends ) ) || ! depends.length ) {
			throw new Error( "Depends argument not found" );
		}

		return munit._module( name, { depends: depends }, callback );
	},

	// Adding custom test comparisons
	custom: function( name, handle ) {
		if ( munit.isObject( name ) ) {
			return munit.each( name, function( fn, method ) {
				munit.custom( method, fn );
			});
		}

		// Ensure that name can be used
		if ( munit.customReserved.indexOf( name ) > -1 ) {
			throw new Error( "'" + name + "' is a reserved name and cannot be added as a custom assertion test" );
		}

		// Send off to assertion module for attachment
		munit.Assert.prototype[ name ] = handle;
		munit.each( munit.ns, function( mod ) {
			mod.custom( name, handle );
		});
	},

	// Better timestamp readability
	_relativeTime: function( time ) {
		var h, m, s;

		if ( time > TIME_HOUR ) {
			h = parseInt( time / TIME_HOUR, 10 );
			m = parseInt( ( time % TIME_HOUR ) / TIME_MINUTE, 10 );
			return h + 'hrs, ' + m + 'mins';
		}
		else if ( time > TIME_MINUTE ) {
			m = parseInt( time / TIME_MINUTE, 10 );
			s = parseInt( ( time % TIME_MINUTE ) / TIME_SECOND, 10 );
			munit.log( m, s );
			return m + 'mins, ' + s + 's';
		}
		else if ( time > TIME_SECOND ) {
			return ( time / TIME_SECOND ) + 's';
		}
		else {
			return time + 'ms';
		}
	},

	// Converts strings to be xml safe
	_xmlEncode: function( string ) {
		return ( string || '' ).replace( ramp, "&amp;" )
			.replace( rquote, "&quot;" )
			.replace( rsquote, "&#039;" )
			.replace( rlt, "&lt;" )
			.replace( rgt, "&gt;" );
	},

	// Helper for printing out errors before exiting
	// TODO: This will help once browser support is added
	exit: function( code, e, message ) {
		if ( message === undefined && munit.isString( e ) ) {
			message = e;
			e = null;
		}

		// Messaging
		if ( munit.isString( message ) ) {
			munit.color.red( message );
		}

		// Error Objects
		if ( munit.isError( e ) ) {
			munit.log( e.stack );
		}

		// Kill process
		process.exit( code );
	},

	// Proxy for nodejs require
	// TODO: This will help once browser support is added
	require: function( path ) {
		require( path );
	},

	// AssertionError stolen from node src for throwing
	AssertionError: function AssertionError( message, startFunc ) {
		var self = this;

		self.name = 'Assertion Error';
		self.message = message + "\n";

		if ( Error.captureStackTrace ) {
			Error.captureStackTrace( self, startFunc );
		}
	}

});


// Attach error to assertation
util.inherits( munit.AssertionError, Error );

// Expose
module.exports = munit;
