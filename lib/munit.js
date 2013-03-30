var fs = require( 'fs' ),
	util = require( 'util' ),
	EventEmitter = require( 'events' ).EventEmitter,
	Slice = Array.prototype.slice,
	toString = Object.prototype.toString,
	TIME_SECOND = 1000,
	TIME_MINUTE = TIME_SECOND * 60,
	TIME_HOUR = TIME_MINUTE * 60,
	TIME_DAY = TIME_HOUR * 24,
	rtestfile = /^test\-[A-Za-z0-9_\-]+\.js$/,
	rhome = /^\~\//,
	rroot = /^\//,
	ramp = /\&/g,
	rquote = /"/g,
	rsquote = /'/g,
	rlt = /</g,
	rgt = />/g;


// Root just creates assertion module
function munit( name, options, callback ) {
	return munit.module( name, options, callback );
}


// Type tests
"Boolean Number String Function Array Date RegExp Object Error".split(' ').forEach(function( method ) {
	if ( method == 'Array' ) {
		return ( munit.isArray = Array.isArray );
	}
	else if ( method == 'Error' ) {
		munit.isError = function( object ) {
			return object && ( object instanceof Error );
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
	version: '0.0.2',
	noop: function(){},
	ns: {},
	passed: 0,
	failed: 0,
	tests: [],
	start: 0,
	end: 0,
	_options: {},
	_lockdown: false,

	// Priority Defaults
	PRIORITY_HIGHEST: 0.8,
	PRIORITY_HIGHER: 0.7,
	PRIORITY_HIGH: 0.6,
	PRIORITY_DEFAULT: 0.5,
	PRIORITY_LOW: 0.4,
	PRIORITY_LOWER: 0.3,
	PRIORITY_LOWEST: 0.2,

	// These options don't inherit from parent modules
	_optionReset: [ 'expect', 'queue' ],

	// Iteraction utility
	each: function( items, fn ) {
		var i, l;

		if ( munit.isArray( items ) ) {
			for ( i = -1, l = items.length; ++i < l; ) {
				if ( fn.call( items[ i ], items[ i ], i ) === false ) {
					break;
				}
			}
		}
		else {
			for ( i in items ) {
				if ( fn.call( items[ i ], items[ i ], i ) === false ) {
					break;
				}
			}
		}

		return items;
	},

	// Attach custom events module to object
	_event: function( object ) {
		if ( ! object ) {
			return object;
		}

		var emitter = object.__EventEmitter = new EventEmitter();
		emitter.on( 'error', munit.noop );
		[ 'on', 'once', 'emit', 'removeListener', 'removeAllListeners' ].forEach(function( name ) {
			if ( ! object.hasOwnProperty( name ) ) {
				object[ name ] = emitter[ name ].bind( emitter );
			}
		});
	},

	// Attaches custom tests to each submodule
	_attachCustom: function( ns, name, handle ) {
		munit.each( ns, function( mod ) {
			mod[ name ] = handle;

			munit._attachCustom( mod.ns, name, handle );
		});
	},

	// Adding custom test comparisons
	custom: function( name, handle ) {
		if ( munit.isObject( name ) ) {
			return munit.each( name, function( fn, method ) {
				munit.custom( method, fn );
			});
		}

		// Attach to assert proto and each existing instance
		munit.Assert.prototype[ name ] = handle;
		munit._attachCustom( munit.ns, name, handle );
	},

	// Module creation
	module: function( name, options, callback ) {
		if ( munit._lockdown ) {
			throw new Error( "munit test modules have already been compiled" );
		}
		else if ( munit.isArray( name ) ) {
			return munit.each( name, function( object ) {
				munit.Modlue( object.name, object.options, object.callback );
			});
		}
		else if ( munit.isObject( name ) ) {
			return munit.each( name, function( callback, name ) {
				munit.Modlue( name, options, callback );
			});
		}

		// Setup
		var ns = munit.ns,
			parts = name.split( '.' ),
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

		// Getter
		if ( options === undefined ) {
			if ( ! ns[ finalPart ] ) {
				ns[ finalPart ] = new munit.Assert( name, assert );
			}

			return ns[ finalPart ];
		}

		// Variable arguments
		if ( callback === undefined && munit.isFunction( options ) ) {
			callback = options;
			options = {};
		}
		// Handle only passing of expected tests to options
		else if ( munit.isNumber( options ) ) {
			options = { expect: options };
		}

		// Module already exists, update it
		if ( ns[ finalPart ] ) {
			assert = ns[ finalPart ];

			// Test module is already in use, code setup is wrong
			if ( assert.callback ) {
				throw new munit.AssertionError( name + " module has already been created", munit.module );
			}
			
			assert.options = munit.extend( true, {}, opts, reset, options || {} );
			assert.callback = callback;
		}
		else {
			options = munit.extend( true, {}, opts, reset, options );
			assert = ns[ finalPart ] = new munit.Assert( name, assert, options, callback );
		}

		// Stack assert module into queue stash when defined
		if ( assert.options.queue && munit.queue.modules.indexOf( assert ) === -1 ) {
			munit.queue.modules.push( assert );
		}

		// Return the assertion module for use
		return assert;
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
			console.log( m, s );
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

	// Path normalization
	_normalizePath: function( path ) {
		if ( rhome.exec( path ) ) {
			path = path.replace( rhome, process.env.HOME + '/' );
		}
		else if ( ! rroot.exec( path ) ) {
			path = process.cwd() + '/' + path;
		}

		return path;
	},

	// Creates directory path if not already
	_mkdir: function( path ) {
		var parts = ( path || '' ).split( /\//g ),
			filepath = '/';

		if ( ! parts[ 0 ].length ) {
			parts.shift();
		}

		parts.forEach(function( dir ) {
			filepath += dir + '/';

			try {
				if ( ! fs.statSync( filepath ).isDirectory() ) {
					throw new Error( 'Requires Directory' );
				}
			}
			catch ( e ) {
				fs.mkdirSync( filepath );
			}
		});
	},

	// Loads up each possible test file
	_render: function( path ) {
		path += '/';
		fs.readdirSync( path ).forEach(function( file ) {
			var fullpath = path + file;

			if ( fs.statSync( fullpath ).isDirectory() ) {
				munit._render( fullpath );
			}
			else if ( rtestfile.exec( file ) ) {
				require( path + file );
			}
		});
	},

	// Renders each module
	_renderNS: function( ns ) {
		munit.each( ns, function( assert, name ) {
			// Root object, close off as no tests are needed
			if ( ! munit.isFunction( assert.callback ) ) {
				assert.close();
			}
			// Stack testable modules up
			else {
				munit.tests.push( assert );
			}

			// Traverse down the module tree
			munit._renderNS( assert.ns );
		});

		return munit.tests;
	},

	// Checks all modules to see if they are finished
	_renderCheck: function(){
		var finished = true,
			now = Date.now(), time,
			color = munit.failed > 0 ? munit.color.get.red : munit.color.get.green,
			options = munit._options || {},
			junit = options.junit ? munit._normalizePath( options.junit ) : null;

		// Check each module
		munit.each( munit.ns, function( mod, name ) {
			if ( ! mod._finished ) {
				return ( finished = false );
			}
		});

		// Only flush full results once all modules have completed
		if ( finished ) {
			time = ( munit.end = now ) - munit.start;

			// Print out JUnit test results
			if ( junit && junit.length ) {
				munit._mkdir( junit += '/' );
				munit.tests.forEach(function( assert ) {
					fs.writeFileSync( junit + assert.nsPath + '.xml', assert.junit() );
				});
			}

			// Print out final results
			console.log([
				"\n",
				color( "Tests Passed: " + munit.passed ),
				color( "Tests Failed: " + munit.failed ),
				color( "Time: " + munit._relativeTime( time ) ),
				"\n"
			].join( "\n" ));

			// Exit with proper code
			process.exit( munit.failed > 0 ? 1 : 0 );
		}
	},

	// Starts the rendering process
	render: function( path, options ) {
		var ns = munit.ns, modules;
		munit._options = options || {};
		munit.start = munit.end = Date.now();

		// Handle directory rendering 
		if ( munit.isString( path ) && path.length ) {
			path = munit._normalizePath( path );

			// Quick checks on path to render
			if ( ! fs.existsSync( path ) || ! fs.statSync( path ).isDirectory() ) {
				munit.color.red( "\n'" + path + "' is not a directory\n" );
				process.exit( 1 );
			}
			else if ( fs.existsSync( path + '/munit.js' ) ) {
				require( path + '/munit.js' );
			}

			// Setup all submodules
			munit._render( path );
		}

		// Find each testable module, then lock it down
		munit._renderNS( munit.ns );
		munit._lockdown = true;

		// Sort modules on priority
		munit.tests.sort(function( a, b ) {
			if ( a.options.priority === b.options.priority ) {
				return a._added === b._added ? 0 :
					a._added > b._added ? 1 :
					-1;
			}
			else {
				return a.options.priority > b.options.priority ? -1 : 1;
			}
		})
		// Trigger modules based on priority
		.forEach(function( assert ) {
			if ( ! assert.options.queue ) {
				assert.trigger();
			}
		});

		// Have the queue check it's modules
		munit.queue.sort();
		munit.queue.check();
	},

	// AssertionError stolen from node src for throwing
	AssertionError: function( message, startFunc ) {
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
