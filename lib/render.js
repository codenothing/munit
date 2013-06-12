var munit = global.munit,
	fs = require( 'fs' ),
	async = require( 'async' ),
	rtestfile = /^test\-(.*?)\.js$/,
	rhome = /^\~\//,
	rroot = /^\//;

function render( path, options ) {
	var ns = munit.ns, modules;

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
				process.exit( 1 );
			}

			// Check for root munit config file
			fs.exists( path + '/munit.js', function( exists ) {
				if ( exists ) {
					require( path + '/munit.js' );
				}

				// Setup all submodules
				render._renderPath( path, render._lockdown );
			});
		});
	}
	else {
		render._lockdown();
	}
}

munit.extend( render, {

	// Meta
	lockdown: false,

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

		if ( ! parts[ 0 ].length ) {
			parts.shift();
		}

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

			async.map( files || [],
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
								require( fullpath );
							}

							callback();
						}
					});
				},
				callback
			);
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
			render._renderNS( assert.ns );
		});

		return munit.tests;
	},

	// Triggered after all file paths have been loaded
	_lockdown: function( e ) {
		if ( e ) {
			throw e;
		}

		// Find each testable module, then lock it down
		render._renderNS( munit.ns );
		render.lockdown = true;

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

	// Finished off test result writing, print out suite results
	_complete: function(){
		var color = munit.color.get[ munit.failed > 0 ? 'red' : 'green' ];

		// Print out final results
		munit.log([
			"\n",
			color( "Tests Passed: " + munit.passed ),
			color( "Tests Failed: " + munit.failed ),
			color( "Time: " + munit._relativeTime( munit.end - munit.start ) ),
			"\n"
		].join( "\n" ));

		// Exit with proper code
		process.exit( munit.failed > 0 ? 1 : 0 );
	},

	// Checks all modules to see if they are finished
	check: function(){
		var finished = true,
			now = Date.now(),
			options = munit._options || {},
			junit = options.junit ? render._normalizePath( options.junit ) : null,
			junitPrefix = options.junitPrefix ? options.junitPrefix + '.' : '';

		// Check each module
		munit.each( munit.ns, function( mod, name ) {
			if ( ! mod._finished ) {
				return ( finished = false );
			}
		});

		// Only flush full results once all modules have completed
		if ( finished ) {
			munit.end = now;

			// Print out JUnit test results
			if ( junit && junit.length ) {
				render._mkdir( junit += '/', function( e ) {
					if ( e ) {
						munit.color.red( "Unable to create junit directory" );
						munit.log( e );
						process.exit( 1 );
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
								process.exit( 1 );
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
