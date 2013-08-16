var munit = global.munit,
	fs = require( 'fs' ),
	async = require( 'async' ),
	rtestfile = /^test\-(.*?)\.js$/,
	rhome = /^\~\//,
	rroot = /^\//,
	rpathsplit = /\./g;

function render( path, options ) {
	// Force default state for rendering
	render.requireState( munit.RENDER_STATE_DEFAULT, render );
	render.state = munit.RENDER_STATE_READ;

	// Allow passing of just path or options
	if ( options === undefined ) {
		options = munit.isString( path ) ? { render: path } : path;
	}
	else {
		options.render = path;
	}

	munit._options = options = options || {};
	munit.start = munit.end = Date.now();

	// Handle directory rendering 
	if ( munit.isString( path = options.render ) && path.length ) {
		path = options.render = render._normalizePath( path );

		// Ensure render path actually exists
		fs.stat( path, function( e, stat ) {
			if ( e || ! stat || ! stat.isDirectory() ) {
				munit.color.red( "\n'" + path + "' is not a directory\n" );
				munit.exit( 1 );
			}

			// Check for root munit config file
			fs.exists( path + '/munit.js', function( exists ) {
				if ( exists ) {
					munit.require( path + '/munit.js' );
				}

				// Setup all submodules
				render._renderPath( path, render._compile );
			});
		});
	}
	else {
		render._compile();
	}
}

munit.extend( render, {

	// Meta
	state: munit.RENDER_STATE_DEFAULT,

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
	_mkdir: function( path, callback ) {
		var parts = ( path || '' ).split( /\//g ),
			filepath = '/';

		// Trim Left
		if ( ! parts[ 0 ].length ) {
			parts.shift();
		}

		// Trim right
		if ( parts.length && ! parts[ parts.length - 1 ].length ) {
			parts.pop();
		}

		// Handle root '/' error
		if ( ! parts.length ) {
			return callback( new Error( "No directory path found to make" ) );
		}

		// Make sure each branch is created
		async.mapSeries( parts,
			function( dir, callback ) {
				fs.stat( filepath += dir + '/', function( e, stat ) {
					if ( stat && stat.isDirectory() ) {
						callback();
					}
					else {
						fs.mkdir( filepath, callback );
					}
				});
			},
			callback
		);
	},

	// Loads up each possible test file
	_renderPath: function( path, callback ) {
		path += '/';
		fs.readdir( path, function( e, files ) {
			if ( e ) {
				return callback( e );
			}

			async.each( files || [],
				function( file, callback ) {
					var fullpath = path + file;

					fs.stat( fullpath, function( e, stat ) {
						if ( e ) {
							callback( e );
						}
						else if ( stat.isDirectory() ) {
							render._renderPath( fullpath, callback );
						}
						else {
							if ( stat.isFile() && rtestfile.exec( file ) ) {
								munit.require( fullpath );
							}

							callback();
						}
					});
				},
				callback
			);
		});
	},

	// Testing path to see if it exists in the focus option
	focusPath: function( nspath ) {
		var found = true,
			nsparts = nspath.split( rpathsplit );

		// If set, only add modules that belong on the focus path(s)
		if ( munit._options.focus && munit._options.focus.length ) {
			found = false;

			munit._options.focus.forEach(function( fpath ) {
				var fparts = fpath.split( rpathsplit ),
					i = -1, l = Math.min( fparts.length, nsparts.length );

				// Check that each namespace of the focus path
				// exists inside the modules path
				for ( ; ++i < l; ) {
					if ( fparts[ i ] !== nsparts[ i ] ) {
						return;
					}
				}

				// Paths line up
				found = true;
			});
		}

		return found;
	},

	// Throw a generic error based on the current state
	_stateError: function( startFunc ) {
		if ( render.state === munit.RENDER_STATE_DEFAULT ) {
			throw new Error(
				"munit hasn't been rendered yet",
				startFunc || render._stateError
			);
		}
		else if ( render.state === munit.RENDER_STATE_READ ) {
			throw new Error(
				"munit is reading the test directory",
				startFunc || render._stateError
			);
		}
		else if ( render.state === munit.RENDER_STATE_TRIGGER ) {
			throw new Error(
				"munit is triggering all modules",
				startFunc || render._stateError
			);
		}
		else if ( render.state === munit.RENDER_STATE_COMPILE ) {
			throw new Error(
				"munit is compiling the test modules",
				startFunc || render._stateError
			);
		}
		else if ( render.state === munit.RENDER_STATE_ACTIVE ) {
			throw new Error(
				"munit is running the test modules",
				startFunc || render._stateError
			);
		}
		else if ( render.state === munit.RENDER_STATE_FINISHED ) {
			throw new Error(
				"munit is rendering the results",
				startFunc || render._stateError
			);
		}
		else if ( render.state === munit.RENDER_STATE_COMPLETE ) {
			throw new Error(
				"munit is complete",
				startFunc || render._stateError
			);
		}
		else {
			throw new Error(
				"Unknown munit render state error",
				startFunc || render._stateError
			);
		}
	},

	// Throws an error if munit isn't in the required state
	requireState: function( required, startFunc ) {
		if ( required !== render.state ) {
			render._stateError( startFunc );
		}
	},

	// Maximum state requirement
	requireMaxState: function( max, startFunc ) {
		if ( max < render.state ) {
			render._stateError( startFunc );
		}
	},

	// Minimum state requirement
	requireMinState: function( min, startFunc ) {
		if ( min > render.state ) {
			render._stateError( startFunc );
		}
	},

	// Renders each module
	_renderNS: function( ns ) {
		munit.each( ns, function( assert, name ) {
			if ( render.focusPath( assert.nsPath ) ) {
				munit.tests.push( assert );
			}
			else {
				assert.trigger();
			}

			// Traverse down the module tree
			render._renderNS( assert.ns );
		});

		return munit.tests;
	},

	// Checks test modules depencies to see if it can be run
	checkDepency: function( assert ) {
		var stack = [], depends, i, l, module;

		// Should only be checking dependencies when in compile mode
		render.requireMinState( munit.RENDER_STATE_COMPILE, render.checkDepency );

		// Build up the list of dependency paths
		do {
			depends = assert.option( 'depends' );

			if ( depends && munit.isArray( depends ) ) {
				stack = stack.concat( depends );
			}
		} while ( assert = assert.parAssert );

		// Check each dependency for completion
		for ( i = -1, l = stack.length; ++i < l; ) {
			if ( munit( stack[ i ] || '' ).state < munit.ASSERT_STATE_CLOSED ) {
				return false;
			}
		}

		return true;
	},

	// Triggered after all file paths have been loaded
	_compile: function( e ) {
		if ( e ) {
			throw e;
		}

		// Swap render state to compile mode for priority generation
		render.requireState( munit.RENDER_STATE_READ, render._compile );
		render.state = munit.RENDER_STATE_COMPILE;
		render._renderNS( munit.ns );

		// Just in case triggers set off any undesired state
		render.requireState( munit.RENDER_STATE_COMPILE, render._compile );
		render.state = munit.RENDER_STATE_TRIGGER;

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
			// Stack modules waiting on a queue
			if ( assert.options.queue ) {
				munit.queue.addModule( assert );
			}
			else if ( render.checkDepency( assert ) ) {
				assert.trigger();
			}
		});

		// All modules triggered, check to see if we can close out
		render.state = munit.RENDER_STATE_ACTIVE;
		render.check();
	},

	// Finished off test result writing, print out suite results
	_complete: function(){
		var color = munit.color.get[ munit.failed > 0 ? 'red' : 'green' ];

		// Can only complete a finished munit
		render.requireState( munit.RENDER_STATE_FINISHED, render._complete );
		render.state = munit.RENDER_STATE_COMPLETE;

		// Print out final results
		munit.log([
			"\n",
			color( "Tests Passed: " + munit.passed ),
			color( "Tests Failed: " + munit.failed ),
			color( "Tests Skipped: " + munit.skipped ),
			color( "Time: " + munit._relativeTime( munit.end - munit.start ) ),
			"\n"
		].join( "\n" ));

		// Only exit if there is an error
		if ( munit.failed > 0 ) {
			munit.exit( 1 );
		}
	},

	// Checks all modules to see if they are finished
	check: function(){
		var finished = true,
			now = Date.now(),
			options = munit._options || {},
			junit = options.junit ? render._normalizePath( options.junit ) : null,
			junitPrefix = options.junitPrefix ? options.junitPrefix + '.' : '';

		// Wait until all modules have been triggered before checking states
		if ( render.state < munit.RENDER_STATE_ACTIVE ) {
			return;
		}

		// Can only check an active munit
		render.requireState( munit.RENDER_STATE_ACTIVE, render.check );

		// Check each module
		munit.each( munit.ns, function( mod, name ) {
			if ( mod.state < munit.ASSERT_STATE_FINISHED ) {
				return ( finished = false );
			}
		});

		// Check dependency chains if test suite isn't yet finished
		if ( ! finished ) {
			munit.queue.check();

			// Check each untriggered module to see if it's dependencies have been closed
			munit.tests.forEach(function( assert ) {
				if ( assert.state === munit.ASSERT_STATE_DEFAULT && ! assert.option( 'queue' ) && render.checkDepency( assert ) ) {
					assert.trigger();
				}
			});
		}
		// Only flush full results once all modules have completed
		else {
			render.state = munit.RENDER_STATE_FINISHED;
			munit.end = now;

			// Print out JUnit test results
			if ( junit && junit.length ) {
				render._mkdir( junit += '/', function( e ) {
					if ( e ) {
						munit.color.red( "Unable to create junit directory" );
						munit.log( e );
						munit.exit( 1 );
					}

					async.map(
						munit.tests,
						function( assert, callback ) {
							fs.writeFile( junit + junitPrefix + assert.nsPath + '.xml', assert.junit(), callback );
						},
						function( e ) {
							if ( e ) {
								munit.color.red( "Unable to create junit directory" );
								munit.log( e );
								munit.exit( 1 );
							}

							render._complete();
						}
					);
				});
			}
			else {
				render._complete();
			}
		}
	}

});


// Expose
munit.render = render;
