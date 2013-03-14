var fs = require( 'fs' ),
	util = require( 'util' ),
	EventEmitter = require( 'events' ).EventEmitter,
	Slice = Array.prototype.slice,
	toString = Object.prototype.toString,
	rtestfile = /^test\-[A-Za-z0-9_\-]+\.js$/,
	rhome = /^\~\//,
	rroot = /^\//;


// Root just creates assertion module
function MUnit( name, options, callback ) {
	return MUnit.Module( name, options, callback );
}


// Type tests
"Boolean Number String Function Array Date RegExp Object Error".split(' ').forEach(function( method ) {
	if ( method == 'Array' ) {
		return ( MUnit.isArray = Array.isArray );
	}
	else if ( method == 'Error' ) {
		MUnit.isError = function( object ) {
			return object && ( object instanceof Error );
		};

		return;
	}

	var match = '[object ' + method + ']';
	MUnit[ 'is' + method ] = function( object ) {
		return object !== undefined && object !== null && toString.call( object ) == match;
	};
});


// Object extension utility
MUnit.extend = function(){
	var args = Slice.call( arguments ), i = -1, l = args.length, deep = false, target = this, name, copy;

	// Check for deep copy
	if ( MUnit.isBoolean( args[ 0 ] ) ) {
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
			if ( deep && copy[ name ] && MUnit.isArray( copy[ name ] ) ) {
				target[ name ] = MUnit.extend( deep, target[ name ] || [], copy[ name ] );
			}
			else if ( deep && MUnit.isObject( copy[ name ] ) ) {
				target[ name ] = MUnit.extend( deep, target[ name ] || {}, copy[ name ] );
			}
			else {
				target[ name ] = copy[ name ];
			}
		}
	}

	return target;
};


// Attach properties
MUnit.extend({

	// Setup
	version: '0.0.1',
	noop: function(){},
	ns: {},
	passed: 0,
	failed: 0,

	// These options don't inherit from parent modules
	_optionReset: [ 'expect', 'queue' ],

	// Iteraction utility
	each: function( items, fn ) {
		var i, l;

		if ( MUnit.isArray( items ) ) {
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
	Event: function( object ) {
		if ( ! object ) {
			return object;
		}

		var emitter = object.__EventEmitter = new EventEmitter();
		emitter.on( 'error', MUnit.noop );
		[ 'on', 'once', 'emit', 'removeListener', 'removeAllListeners' ].forEach(function( name ) {
			if ( ! object.hasOwnProperty( name ) ) {
				object[ name ] = emitter[ name ].bind( emitter );
			}
		});
	},

	// Attaches custom tests to each submodule
	_attachCustom: function( ns, name, handle ) {
		MUnit.each( ns, function( mod ) {
			mod[ name ] = handle;

			MUnit._attachCustom( mod.ns, name, handle );
		});
	},

	// Adding custom test comparisons
	Custom: function( name, handle ) {
		if ( MUnit.isObject( name ) ) {
			return MUnit.each( name, function( fn, method ) {
				MUnit.Custom( method, fn );
			});
		}

		// Attach to assert proto and each existing instance
		MUnit.Assert.prototype[ name ] = handle;
		MUnit._attachCustom( MUnit.ns, name, handle );
	},

	// Module creation
	Module: function( name, options, callback ) {
		if ( MUnit.isArray( name ) ) {
			return MUnit.each( name, function( object ) {
				MUnit.Modlue( object.name, object.options, object.callback );
			});
		}
		else if ( MUnit.isObject( name ) ) {
			return MUnit.each( name, function( callback, name ) {
				MUnit.Modlue( name, options, callback );
			});
		}

		// Setup
		var ns = MUnit.ns,
			parts = name.split( '.' ),
			finalPart = parts.pop(),
			opts = MUnit.extend( true, {}, MUnit.Defaults.Settings ),
			reset = {},
			assert = null,
			path = '';

		// Setup option reset based on default values
		MUnit._optionReset.forEach(function( key ) {
			reset[ key ] = MUnit.Defaults.Settings[ key ];
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
				assert = ns[ mod ] = new MUnit.Assert( path, assert, opts );
			}

			// Trickle down the path
			assert = ns[ mod ];
			ns = assert.ns;
			opts = MUnit.extend( true, {}, opts, reset, assert.options );
		});

		// Getter
		if ( options === undefined ) {
			if ( ! ns[ finalPart ] ) {
				ns[ finalPart ] = new MUnit.Assert( name, assert );
			}

			return ns[ finalPart ];
		}

		// Variable arguments
		if ( callback === undefined && MUnit.isFunction( options ) ) {
			callback = options;
			options = {};
		}
		// Handle only passing of expected tests to options
		else if ( MUnit.isNumber( options ) ) {
			options = { expect: options };
		}

		// Module already exists, update it
		if ( ns[ finalPart ] ) {
			assert = ns[ finalPart ];

			// Test module is already in use, code setup is wrong
			if ( assert.callback ) {
				throw new MUnit.AssertionError( name + " module has already been created", MUnit.Module );
			}
			
			assert.options = MUnit.extend( true, {}, opts, reset, options || {} );
			assert.callback = callback;
		}
		else {
			options = MUnit.extend( true, {}, opts, reset, options );
			assert = ns[ finalPart ] = new MUnit.Assert( name, assert, options, callback );
		}

		// Stack assert module into queue stash when defined
		if ( assert.options.queue && MUnit.Queue.modules.indexOf( assert ) === -1 ) {
			MUnit.Queue.modules.push( assert );
		}

		// Return the assertion module for use
		return assert;
	},

	// Loads up each possible test file
	_render: function( path ) {
		path += '/';
		fs.readdirSync( path ).forEach(function( file ) {
			var fullpath = path + file;

			if ( fs.statSync( fullpath ).isDirectory() ) {
				MUnit._render( fullpath );
			}
			else if ( rtestfile.exec( file ) ) {
				require( path + file );
			}
		});
	},

	// Renders each module
	_renderNS: function( ns ) {
		MUnit.each( ns, function( assert, name ) {
			// Root object, close off as no tests are needed
			if ( ! MUnit.isFunction( assert.callback ) ) {
				assert.close();
			}
			// Queued modules are run through the queuer
			else if ( ! assert.options.queue ) {
				assert.callback( assert );

				// Make sure module is really supposed to be asynchronous
				if ( ! assert._closed ) {
					// No limit on expected tests, assume synchronous
					// And if timeout is explicetely null'd out, assume synchronous
					if ( ! assert.options.expect || ! assert.options.timeout ) {
						assert.close();
					}
					// Attach timeout while the module is running
					else {
						assert._timeid = setTimeout(function(){
							if ( ! assert._closed ) {
								assert.close();
							}
						}, assert.options.timeout);
					}
				}
			}

			// Traverse down the module tree
			MUnit._renderNS( assert.ns );
		});
	},

	// Checks all modules to see if they are finished
	_renderCheck: function(){
		var finished = true,
			color = MUnit.failed > 0 ? MUnit.Color.get.red : MUnit.Color.get.green;

		// Check each module
		MUnit.each( MUnit.ns, function( mod, name ) {
			if ( ! mod._finished ) {
				return ( finished = false );
			}
		});

		// Only flush full results once all modules have completed
		if ( finished ) {
			console.log([
				"\n",
				color( "Tests Passed: " + MUnit.passed ),
				color( "Tests Failed: " + MUnit.failed ),
				"\n"
			].join( "\n" ));

			process.exit( MUnit.failed > 0 ? 1 : 0 );
		}
	},

	// Starts the rendering process
	render: function( path ) {
		var ns = MUnit.ns;

		// Handle directory rendering 
		if ( MUnit.isString( path ) && path.length ) {
			// Normalize path
			if ( rhome.exec( path ) ) {
				path = path.replace( rhome, process.env.HOME + '/' );
			}
			else if ( ! rroot.exec( path ) ) {
				path = process.cwd() + '/' + path;
			}

			// Quick checks on path to render
			if ( ! fs.existsSync( path ) || ! fs.statSync( path ).isDirectory() ) {
				MUnit.Color.red( "\n'" + path + "' is not a directory\n" );
				process.exit( 1 );
			}
			else if ( fs.existsSync( path + '/munit.js' ) ) {
				require( path + '/munit.js' );
			}

			// Setup all submodules
			MUnit._render( path );
		}

		// Trigger each module independently
		MUnit._renderNS( MUnit.ns );

		// Have the queue check it's modules
		MUnit.Queue.check();
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
util.inherits( MUnit.AssertionError, Error );

// Expose
module.exports = MUnit;
