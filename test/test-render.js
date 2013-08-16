var fs = require( 'fs' ),
	async = require( 'async' ),
	render = MUNIT.render;

// Core render functions and properties
munit( 'render.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	assert.isFunction( 'render', render )
		.equal( 'state', render.state, MUNIT.RENDER_STATE_DEFAULT )
		.isFunction( 'requireState', render.requireState )
		.isFunction( 'requireMaxState', render.requireMaxState )
		.isFunction( 'requireMinState', render.requireMinState )
		.isFunction( 'focusPath', render.focusPath )
		.isFunction( 'checkDepency', render.checkDepency )
		.isFunction( 'check', render.check );
});


// Normal tests
munit( 'render', {

	// Normalize path testing
	_normalizePath: function( assert ) {
		[

			{
				name: 'Home Translation',
				before: "~/a/b/c",
				after: process.env.HOME + '/a/b/c'
			},

			{
				name: 'CWD',
				before: "cwd/path",
				after: process.cwd() + '/cwd/path'
			},

			{
				name: 'Nothing',
				before: "/a/root/path",
				after: "/a/root/path"
			}

		].forEach(function( object ) {
			assert.equal( object.name, render._normalizePath( object.before ), object.after );
		});
	},

	// Recursive mkdir testing
	_mkdir: function( assert ) {
		var callback = assert.spy(),
			fs = require( 'fs' ),

			// Stat spy
			isDirSpy = assert.spy({ returnValue: true }),
			mockStat = { isDirectory: isDirSpy },
			statSpy = assert.spy( fs, 'stat', {
				onCall: function( path, callback ) {
					callback( null, mockStat );
				}
			}),

			// mkdir spy
			mkdirSpy = assert.spy( fs, 'mkdir', {
				onCall: function( path, callback ) {
					callback();
				}
			});

		// Test successful find path
		render._mkdir( "/a/b/c/", callback );
		assert.equal( 'fs.stat triggered for each dir', statSpy.count, 3 );
		assert.equal( 'fs.stat 1st path', statSpy.history[ 0 ].args[ 0 ], "/a/" );
		assert.equal( 'fs.stat 2nd path', statSpy.history[ 1 ].args[ 0 ], "/a/b/" );
		assert.equal( 'fs.stat 3rd path', statSpy.history[ 2 ].args[ 0 ], "/a/b/c/" );
		assert.equal( 'isDirectory triggered for each dir', isDirSpy.count, 3 );
		assert.equal( 'mkdir never called with isDir returning true', mkdirSpy.count, 0 );
		assert.equal( 'callback triggered', callback.count, 1 );
		assert.empty( 'callback no error', callback.args[ 0 ] );

		// Test successful mkdir path
		statSpy.option( 'onCall', function( path, callback ) {
			callback( "Stat Test Path Not Found" );
		});
		render._mkdir( "/a/b/c/", callback );
		assert.equal( 'fs.stat still triggered for each dir', statSpy.count, 6 );
		assert.equal( 'isDirectory never called with no stat object', isDirSpy.count, 3 );
		assert.equal( 'mkdir callback with every dir', mkdirSpy.count, 3 );
		assert.equal( 'callback still triggered', callback.count, 2 );
		assert.empty( 'callback no error with stat error', callback.args[ 0 ] );

		// Test quick failure when trying to create root path
		render._mkdir( "/", callback );
		assert.equal( 'root creation fail callback triggered', callback.count, 3 );
		assert.isError( 'fail when trying to create root', callback.args[ 0 ] );
		assert.equal( 'fs.stat never triggered on root failure', statSpy.count, 6 );
	},

	// Testing gathering of assert scripts
	_renderPath: function( assert ) {
		var requireSpy = assert.spy( MUNIT, 'require' ),
			callback = assert.spy(),

			// _renderPath triggers itself while traversing down directories
			_renderPath = render._renderPath,
			pathSpy = assert.spy( render, '_renderPath', {
				onCall: function( path, callback ) {
					callback();
				}
			}),

			// Mock stat spy
			isDirSpy = assert.spy({ returnValue: true }),
			isFileSpy = assert.spy({ returnValue: true }),
			mockStat = { isDirectory: isDirSpy, isFile: isFileSpy },

			// file system spies
			fs = require( 'fs' ),
			readSpy = assert.spy( fs, 'readdir', {
				onCall: function( path, callback ) {
					callback( null, [ 'subdir' ] );
				}
			}),
			statSpy = assert.spy( fs, 'stat', {
				onCall: function( path, callback ) {
					callback( null, mockStat );
				}
			});

		// Test success directory path
		_renderPath( "/a/b/c", callback );
		assert.equal( 'readdir triggered', readSpy.count, 1 );
		assert.equal( 'readdir arg path with appended slash', readSpy.args[ 0 ], "/a/b/c/" );
		assert.equal( 'stat triggered', statSpy.count, 1 );
		assert.equal( 'stat arg path with appended file', statSpy.args[ 0 ], "/a/b/c/subdir" );
		assert.equal( 'stat.isDirectory triggered', isDirSpy.count, 1 );
		assert.equal( 'render._renderPath triggered for directory traversal', pathSpy.count, 1 );
		assert.equal( 'render._renderPath arg full path', pathSpy.args[ 0 ], "/a/b/c/subdir" );
		assert.equal( 'isFile not triggered since directory was found', isFileSpy.count, 0 );
		assert.equal( 'callback triggered on successful run', callback.count, 1 );

		// Test success file path
		isDirSpy.option( 'returnValue', false );
		readSpy.option( 'onCall', function( path, callback ) {
			callback( null, [ 'test-file.js' ] );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'file-test stat path', statSpy.args[ 0 ], "/a/b/c/test-file.js" );
		assert.equal( 'file-test stat.isDirectory still triggered', isDirSpy.count, 2 );
		assert.equal( 'file-test renderPath not called on file read', pathSpy.count, 1 );
		assert.equal( 'file-test isFile triggered', isFileSpy.count, 1 );
		assert.equal( 'file-test require triggered', requireSpy.count, 1 );
		assert.equal( 'file-test callback triggered', callback.count, 2 );

		// Test success non-match
		readSpy.option( 'onCall', function( path, callback ) {
			callback( null, [ 'file.js' ] );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'file.js stat path', statSpy.args[ 0 ], "/a/b/c/file.js" );
		assert.equal( 'file.js stat.isDirectory still triggered', isDirSpy.count, 3 );
		assert.equal( 'file.js stat.isFile still triggered', isFileSpy.count, 2 );
		assert.equal( 'file.js require not triggered with bad file format', requireSpy.count, 1 );
		assert.equal( 'file.js callback triggered', callback.count, 3 );

		// Test stat error
		statSpy.option( 'onCall', function( path, callback ) {
			callback( "Test Stat Error" );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'stat error callback triggered', callback.count, 4 );
		assert.equal( 'stat error callback error string', callback.args[ 0 ], "Test Stat Error" );

		// Test readdir error
		readSpy.option( 'onCall', function( path, callback ) {
			callback( "Test Read Dir Error" );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'readdir error callback triggered', callback.count, 5 );
		assert.equal( 'readdir error callback error string', callback.args[ 0 ], "Test Read Dir Error" );
	},

	// Testing that string paths exist in the focus list
	focusPath: function( assert ) {
		var _options = MUNIT._options;
		MUNIT._options = {
			focus: [
				"a.b.c",
				"e.f",
				"h"
			]
		};

		// List of tests to check
		[

			{
				name: 'Basic',
				path: "a.b.c.my module",
				expect: true
			},

			{
				name: 'Parent Path',
				path: "a.b",
				expect: true
			},

			{
				name: 'Root Path',
				path: "e",
				expect: true
			},

			{
				name: 'Root Match',
				path: "h",
				expect: true
			},

			{
				name: 'Nested Focus',
				path: "h.t.g",
				expect: true
			},

			{
				name: 'No Match',
				path: "a.b.z.my module",
				expect: false
			},

			{
				name: 'No Match Root',
				path: "z",
				expect: false
			}

		].forEach(function( object ) {
			assert.equal( object.name, render.focusPath( object.path ), object.expect );
		});

		// Reset options to their original state
		MUNIT._options = _options;
	},

	// State error testing
	_stateError: function( assert ) {
		var _state = render.state;

		// Starting state should be the default state
		assert.equal( 'Starting Default State', MUNIT.RENDER_STATE_DEFAULT, render.state );

		// Ensure the correct error is thrown on each state
		[

			{
				name: 'Default State Error',
				state: MUNIT.RENDER_STATE_DEFAULT,
				match: /munit hasn't been rendered yet/
			},

			{
				name: 'Read State Error',
				state: MUNIT.RENDER_STATE_READ,
				match: /munit is reading the test directory/
			},

			{
				name: 'Compile State Error',
				state: MUNIT.RENDER_STATE_COMPILE,
				match: /munit is compiling the test modules/
			},

			{
				name: 'Trigger State Error',
				state: MUNIT.RENDER_STATE_TRIGGER,
				match: /munit is triggering all modules/
			},

			{
				name: 'Active State Error',
				state: MUNIT.RENDER_STATE_ACTIVE,
				match: /munit is running the test modules/
			},

			{
				name: 'Finished State Error',
				state: MUNIT.RENDER_STATE_FINISHED,
				match: /munit is rendering the results/
			},

			{
				name: 'Complete State Error',
				state: MUNIT.RENDER_STATE_COMPLETE,
				match: /munit is complete/
			},

			{
				name: 'Unknown State Error',
				state: -42,
				match: /Unknown munit render state error/
			}

		].forEach(function( object ) {
			render.state = object.state;
			assert.throws( object.name, object.match, function(){
				render._stateError();
			});
		});

		// Reset default state
		render.state = _state;
	},

	// Require exact state testing
	requireState: function( assert ) {
		var _state = render.state;

		render.state = MUNIT.RENDER_STATE_ACTIVE;
		assert.doesNotThrow( 'State Matches', function(){
			render.requireState( MUNIT.RENDER_STATE_ACTIVE );
		});

		render.state = MUNIT.RENDER_STATE_COMPLETE;
		assert.throws( "State Doesn't Match", /munit is complete/, function(){
			render.requireState( MUNIT.RENDER_STATE_ACTIVE );
		});

		// Reapply original state
		render.state = _state;
	},

	// Max state testing
	requireMaxState: function( assert ) {
		var _state = render.state;

		render.state = MUNIT.RENDER_STATE_DEFAULT;
		assert.doesNotThrow( 'Passing', function(){
			render.requireMaxState( MUNIT.RENDER_STATE_READ );
		});

		render.state = MUNIT.RENDER_STATE_COMPILE;
		assert.doesNotThrow( "Equal states pass", function(){
			render.requireMaxState( MUNIT.RENDER_STATE_COMPILE );
		});

		render.state = MUNIT.RENDER_STATE_COMPILE;
		assert.throws( "State too large", /munit is compiling the test modules/, function(){
			render.requireMaxState( MUNIT.RENDER_STATE_READ );
		});

		// Reapply original state
		render.state = _state;
	},

	// Min state testing
	requireMinState: function( assert ) {
		var _state = render.state;

		render.state = MUNIT.RENDER_STATE_READ;
		assert.doesNotThrow( 'Passing', function(){
			render.requireMinState( MUNIT.RENDER_STATE_DEFAULT );
		});

		render.state = MUNIT.RENDER_STATE_READ;
		assert.doesNotThrow( "Equal states pass", function(){
			render.requireMinState( MUNIT.RENDER_STATE_READ );
		});

		render.state = MUNIT.RENDER_STATE_READ;
		assert.throws( "State too small", /munit is reading the test directory/, function(){
			render.requireMinState( MUNIT.RENDER_STATE_COMPILE );
		});

		// Reapply original state
		render.state = _state;
	},

	// Dependency Check testing
	checkDepency: function( assert ) {
		var _state = render.state,
			_ns = MUNIT.ns;

		// Setup test dependency chain
		MUNIT.ns = {};
		MUNIT( 'a.b', { depends: [ 'g.f' ] } );
		MUNIT( 'a.b.c', { depends: [ 'e.f' ] } );
		MUNIT( 'a.b.d', { depends: [ 'a.b.c' ] } );
		MUNIT( 'o.h', { depends: [ 'g.f', 'g.k' ] } );
		MUNIT( 'o.f', { depends: [ 'g.f', 'e.f' ] } );
		MUNIT( 'g.f' ).state = MUNIT.ASSERT_STATE_COMPLETE;
		MUNIT( 'g.k' ).state = MUNIT.ASSERT_STATE_COMPLETE;
		MUNIT( 'e.f' ).state = MUNIT.ASSERT_STATE_ACTIVE;

		// Test throwing when in startup mode
		render.state = MUNIT.RENDER_STATE_READ;
		assert.throws( 'Cant check dependency during startup', /munit is reading the test directory/, function(){
			render.checkDepency();
		});
		render.state = MUNIT.RENDER_STATE_COMPILE;


		// Test differen't types of dependency paths
		[

			{
				name: 'Direct Single Check',
				path: 'a.b',
				match: true
			},

			{
				name: 'Multi Check',
				path: 'o.h',
				match: true
			},

			{
				name: 'Direct Fail',
				path: 'a.b.c',
				match: false
			},

			{
				name: 'Multi Fail',
				path: 'o.f',
				match: false
			},

			{
				name: 'Waiting For Dependency',
				path: 'a.b.d',
				match: false
			},

		].forEach(function( object ) {
			assert.equal( object.name, render.checkDepency( MUNIT( object.path ) ), object.match );
		});

		// Reapply original states
		render.state = _state;
		MUNIT.ns = _ns;
	},

	// Test suite finalization
	_complete: function( assert ) {
		var exitSpy = assert.spy( MUNIT, 'exit' ),
			logSpy = assert.spy( MUNIT, 'log' ),
			_state = render.state,
			_failed = MUNIT.failed;

		// Should only complete when in finished state
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		assert.throws( 'state error', /munit hasn't been rendered yet/, function(){
			render._complete();
		});

		// Setup for successful completion
		render.state = MUNIT.RENDER_STATE_FINISHED;
		MUNIT.failed = 0;
		render._complete();
		assert.equal( 'success completed, logger triggered', logSpy.count, 1 );
		assert.equal( 'success completed, exit should not be called', exitSpy.count, 0 );

		// Setup for failed completion
		render.state = MUNIT.RENDER_STATE_FINISHED;
		MUNIT.failed = 5;
		render._complete();
		assert.equal( 'error completed, logger triggered', logSpy.count, 2 );
		assert.equal( 'error completed, exit triggered', exitSpy.count, 1 );

		// Restore defaults
		render.state = _state;
		MUNIT.failed = _failed;
	},

	// Full test completion check testing
	check: function( assert ) {
		var checkSpy = assert.spy( MUNIT.queue, 'check' ),
			mkdirSpy = assert.spy( render, '_mkdir' ),
			completeSpy = assert.spy( render, '_complete' ),
			_state = render.state,
			_options = MUNIT._options,
			_ns = MUNIT.ns;

		// Check should return without triggering anything when not in active state
		MUNIT.ns = {};
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		render.check();
		assert.equal( 'default state return, no check trigger', checkSpy.count, 0 );
		assert.equal( 'default state return, no mkdir trigger', mkdirSpy.count, 0 );
		assert.equal( 'default state return, no complete trigger', completeSpy.count, 0 );

		// Check should throw when not in active state
		render.state = MUNIT.RENDER_STATE_FINISHED;
		assert.throws( "Throw Non Active", /munit is rendering the results/, function(){
			render.check();
		});
		assert.equal( 'finished state thrown, no check trigger', checkSpy.count, 0 );
		assert.equal( 'finished state thrown, no mkdir trigger', mkdirSpy.count, 0 );
		assert.equal( 'finished state thrown, no complete trigger', completeSpy.count, 0 );

		// Test that we go through a check process when munit isn't finished
		// Note that we are relying on assert modules with queue option to not be triggered
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		MUNIT( 'Main', { queue: true }, munit.noop ).state = MUNIT.ASSERT_STATE_ACTIVE;
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( 'queue check, queue.check trigger', checkSpy.count, 1 );
		assert.equal( 'queue check, no mkdir trigger', mkdirSpy.count, 0 );
		assert.equal( 'queue check, no complete trigger', completeSpy.count, 0 );

		// Test that mkdir gets triggered for junit test results when everything is finished
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		MUNIT.ns = {};
		MUNIT._options = { junit: __dirname + '/fake-test-results/' };
		MUNIT( 'Main', { queue: true }, munit.noop ).state = MUNIT.ASSERT_STATE_FINISHED;
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( 'junit mkdir, no check trigger', checkSpy.count, 1 );
		assert.equal( 'junit mkdir, mkdir triggered', mkdirSpy.count, 1 );
		assert.equal( 'junit mkdir, no complete trigger', completeSpy.count, 0 );
		assert.equal( 'Finished Results _mkdir State', render.state, MUNIT.RENDER_STATE_FINISHED );

		// Test that mkdir gets triggered for junit test results when everything is finished
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		MUNIT.ns = {};
		MUNIT._options = {};
		MUNIT( 'Main', { queue: true }, munit.noop ).state = MUNIT.ASSERT_STATE_FINISHED;
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( 'no junit, no check trigger', checkSpy.count, 1 );
		assert.equal( 'no junit, no mkdir trigger', mkdirSpy.count, 1 );
		assert.equal( 'no junit, complete triggered', completeSpy.count, 1 );
		assert.equal( 'Finished _complete State', render.state, MUNIT.RENDER_STATE_FINISHED );

		// Reapply original states
		render.state = _state;
		MUNIT.ns = _ns;
		MUNIT._options = _options;
	}

});
