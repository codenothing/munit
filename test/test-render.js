var render = MUNIT.render;

// Core render functions and properties
munit( 'render.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	assert.isFunction( 'render', render )
		.isFunction( 'addFormat', render.addFormat )
		.isFunction( 'removeFormat', render.removeFormat )
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

	// munit.render() root tests
	render_root: function( assert ) {
		var stateSpy = assert.spy( render, 'requireState' ),
			nowSpy = assert.spy( Date, 'now', { returnValue: 4253 } ),
			setupSpy = assert.spy( render, '_setup' ),
			compileSpy = assert.spy( render, '_compile' ),
			_callback = render.callback,
			_state = render.state;

		// No arguments
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		MUNIT.render();
		assert.equal( 'requireState triggered', stateSpy.count, 1 );
		assert.deepEqual( 'requireState args', stateSpy.args, [ MUNIT.RENDER_STATE_DEFAULT, render ] );
		assert.equal( 'render state switched to read once started', render.state, MUNIT.RENDER_STATE_READ );
		assert.deepEqual( 'munit._options when non are passed', MUNIT._options, {} );
		assert.equal( 'start set to now', MUNIT.start, 4253 );
		assert.equal( 'end set to now in case of premature exit', MUNIT.end, 4253 );
		assert.equal( 'setup not triggered when no arguments are passed', setupSpy.count, 0 );
		assert.equal( 'compile triggered right away when no path is passed', compileSpy.count, 1 );

		// munit.render( path )
		MUNIT.render( '/a/b/c' );
		assert.deepEqual( 'path only - munit._options', MUNIT._options, { render: '/a/b/c' } );
		assert.isUndefined( 'path only - no callback', render.callback );
		assert.equal( 'path only - setup triggered', setupSpy.count, 1 );
		assert.equal( 'path only - compile not triggered with render path', compileSpy.count, 1 );

		// munit.render( options )
		MUNIT.render({ focus: 'core' });
		assert.deepEqual( 'options only - munit._options', MUNIT._options, { focus: 'core' } );
		assert.isUndefined( 'options only - no callback', render.callback );
		assert.equal( 'options only - setup triggered', setupSpy.count, 1 );
		assert.equal( 'options only - compile not triggered with render path', compileSpy.count, 2 );

		// munit.render( callback )
		MUNIT.render( munit.noop );
		assert.deepEqual( 'callback only - munit._options', MUNIT._options, {} );
		assert.equal( 'callback only - callback passed', render.callback, munit.noop );
		assert.equal( 'callback only - setup not triggered without render path', setupSpy.count, 1 );
		assert.equal( 'callback only - compile triggered without render path', compileSpy.count, 3 );

		// munit.render( path, options )
		MUNIT.render( '/a/b/c', { focus: 'core' } );
		assert.deepEqual( 'path & options - munit._options', MUNIT._options, { render: '/a/b/c', focus: 'core' } );
		assert.isUndefined( 'path & options - no callback', render.callback );
		assert.equal( 'path & options - setup triggered', setupSpy.count, 2 );
		assert.equal( 'path & options - compile not triggered with render path', compileSpy.count, 3 );

		// munit.render( path, callback )
		MUNIT.render( '/a/b/c', munit.noop );
		assert.deepEqual( 'path & callback - munit._options', MUNIT._options, { render: '/a/b/c' } );
		assert.equal( 'path & callback - callback passed', render.callback, munit.noop );
		assert.equal( 'path & callback - setup triggered', setupSpy.count, 3 );
		assert.equal( 'path & callback - compile not triggered with render path', compileSpy.count, 3 );

		// munit.render( options, callback )
		MUNIT.render( { render: '/a/b/c' }, munit.noop );
		assert.deepEqual( 'options & callback - munit._options', MUNIT._options, { render: '/a/b/c' } );
		assert.equal( 'options & callback - callback passed', render.callback, munit.noop );
		assert.equal( 'options & callback - setup triggered', setupSpy.count, 4 );
		assert.equal( 'options & callback - compile not triggered with render path', compileSpy.count, 3 );

		// munit.render( path, options, callback )
		MUNIT.render( '/a/b/c', { focus: 'core' }, munit.noop );
		assert.deepEqual( 'path, options & callback - munit._options', MUNIT._options, { render: '/a/b/c', focus: 'core' } );
		assert.equal( 'path, options & callback - callback passed', render.callback, munit.noop );
		assert.equal( 'path, options & callback - setup triggered', setupSpy.count, 5 );
		assert.equal( 'path, options & callback - compile not triggered with render path', compileSpy.count, 3 );

		// Restore
		render.state = _state;
		render.callback = _callback;
	},

	// Adding result format testing
	addFormat: function( assert ) {
		var name = 'TESTING_ADD_FORMAT',
			callback = munit.noop;

		// Make sure internal caches exist
		assert.isArray( '_formats exist', render._formats );
		assert.isObject( '_formatHash exist', render._formatHash );

		// Success
		assert.doesNotThrow( 'successful format addition', function(){
			render.addFormat( name, callback );
		});
		assert.deepEqual( 'format stored in list', render._formats[ render._formats.length - 1 ], { name: name, callback: callback } );
		assert.deepEqual( 'format stored in hash', render._formatHash[ name ], { name: name, callback: callback } );

		// Errors
		assert.throws( 'throws when no name is provided', 'Name not found for formatter', function(){
			render.addFormat( null, callback );
		});
		assert.throws( 'throws when no empty string name provided', 'Name not found for formatter', function(){
			render.addFormat( "", callback );
		});
		assert.throws( 'throws when no callback is provided', 'Callback not found for formatter', function(){
			render.addFormat( name );
		});
		assert.throws( 'throws when callback is not a function', 'Callback not found for formatter', function(){
			render.addFormat( name, {} );
		});
		assert.throws( 'throws when attempting to overwrite', "Format 'TESTING_ADD_FORMAT' already exists", function(){
			render.addFormat( name, callback );
		});

		// Cleanup
		if ( render._formats[ render._formats.length - 1 ].name === name ) {
			render._formats.pop();
		}
		if ( render._formatHash[ name ] ) {
			delete render._formatHash[ name ];
		}
	},

	// Removing result format testing
	removeFormat: function( assert ) {
		var name = 'TESTING_ADD_FORMAT',
			callback = munit.noop,
			original = render._formats.length;

		// Assume addFormat works from the tests above
		render.addFormat( name, callback );

		// Success
		assert.doesNotThrow( 'successful format removal', function(){
			render.removeFormat( name );
		});
		assert.equal( 'formats list length same as before', render._formats.length, original );
		assert.empty( 'format no longer exists in hash', render._formatHash[ name ] );

		// Error out when no name provided
		assert.throws( 'throws when no name provided', "Name not found for removing formatter", function(){
			render.removeFormat( null );
		});
		assert.throws( 'throws when empty string name is provided', "Name not found for removing formatter", function(){
			render.removeFormat( "" );
		});

		// Sanity Cleanup (shouldn't be needed, but just in case of failing test)
		if ( render._formats[ render._formats.length - 1 ].name === name ) {
			render._formats.pop();
		}
		if ( render._formatHash[ name ] ) {
			delete render._formatHash[ name ];
		}
	},

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
			_options = MUNIT._options,

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

		// Test success custom file path
		MUNIT._options = { file_match: /^custom\-(.*?)\.js$/ };
		isDirSpy.option( 'returnValue', false );
		readSpy.option( 'onCall', function( path, callback ) {
			callback( null, [ 'custom-file.js' ] );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'custom-file-test stat path', statSpy.args[ 0 ], "/a/b/c/custom-file.js" );
		assert.equal( 'custom-file-test stat.isDirectory still triggered', isDirSpy.count, 3 );
		assert.equal( 'custom-file-test renderPath not called on file read', pathSpy.count, 1 );
		assert.equal( 'custom-file-test isFile triggered', isFileSpy.count, 2 );
		assert.equal( 'custom-file-test require triggered', requireSpy.count, 2 );
		assert.equal( 'custom-file-test callback triggered', callback.count, 3 );

		// Test success non-match
		readSpy.option( 'onCall', function( path, callback ) {
			callback( null, [ 'file.js' ] );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'file.js stat path', statSpy.args[ 0 ], "/a/b/c/file.js" );
		assert.equal( 'file.js stat.isDirectory still triggered', isDirSpy.count, 4 );
		assert.equal( 'file.js stat.isFile still triggered', isFileSpy.count, 3 );
		assert.equal( 'file.js require not triggered with bad file format', requireSpy.count, 2 );
		assert.equal( 'file.js callback triggered', callback.count, 4 );

		// Test stat error
		statSpy.option( 'onCall', function( path, callback ) {
			callback( "Test Stat Error" );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'stat error callback triggered', callback.count, 5 );
		assert.equal( 'stat error callback error string', callback.args[ 0 ], "Test Stat Error" );

		// Test readdir error
		readSpy.option( 'onCall', function( path, callback ) {
			callback( "Test Read Dir Error" );
		});
		_renderPath( "/a/b/c", callback );
		assert.equal( 'readdir error callback triggered', callback.count, 6 );
		assert.equal( 'readdir error callback error string', callback.args[ 0 ], "Test Read Dir Error" );

		// Restore
		MUNIT._options = _options;
	},

	// Testing that string paths exist in the focus list
	focusPath: function( assert ) {
		var _options = MUNIT._options;

		// Single focus path
		MUNIT._options = { focus: 'a.b.c' };
		assert.equal( 'Single Basic', render.focusPath( 'a.b.c.my module' ), true );
		assert.equal( 'Single Parent Path', render.focusPath( 'a.b' ), true );
		assert.equal( 'Single No Match', render.focusPath( 'a.b.z.my module' ), false );
		assert.equal( 'Single No Match Root', render.focusPath( 'z' ), false );

		// Multiple focus paths
		MUNIT._options = {
			focus: [
				"a.b.c",
				"e.f",
				"h"
			]
		};
		assert.equal( 'Basic', render.focusPath( 'a.b.c.my module' ), true );
		assert.equal( 'Parent Path', render.focusPath( 'a.b' ), true );
		assert.equal( 'Root Path', render.focusPath( 'e' ), true );
		assert.equal( 'Root Match', render.focusPath( 'h' ), true );
		assert.equal( 'Nested Focus', render.focusPath( 'h.t.g' ), true );
		assert.equal( 'No Match', render.focusPath( 'a.b.z.my module' ), false );
		assert.equal( 'No Match Root', render.focusPath( 'z' ), false );

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

	// State error testing
	requireState: function( assert ) {
		var _state = render.state,
			stateSpy = assert.spy( render, '_stateError' );

		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.requireState( MUNIT.RENDER_STATE_ACTIVE );
		assert.equal( 'state error not triggered when state matches', stateSpy.count, 0 );

		render.state = MUNIT.RENDER_STATE_READ;
		render.requireState( MUNIT.RENDER_STATE_COMPILE );
		assert.equal( 'state error triggered when state does not match', stateSpy.count, 1 );
		assert.deepEqual( 'state error args no startFunc', stateSpy.args, [ render.requireState ] );

		render.requireState( MUNIT.RENDER_STATE_COMPILE, munit.noop );
		assert.deepEqual( 'state error with custom start func', stateSpy.args, [ munit.noop ] );

		// Reapply original state
		render.state = _state;
	},

	// Max state testing
	requireMaxState: function( assert ) {
		var _state = render.state,
			stateSpy = assert.spy( render, '_stateError' );

		render.state = MUNIT.RENDER_STATE_DEFAULT;
		render.requireMaxState( MUNIT.RENDER_STATE_READ );
		assert.equal( 'state error not triggered when state matches', stateSpy.count, 0 );

		render.state = MUNIT.RENDER_STATE_COMPILE;
		render.requireMaxState( MUNIT.RENDER_STATE_COMPILE );
		assert.equal( 'equal states pass', stateSpy.count, 0 );

		render.state = MUNIT.RENDER_STATE_COMPILE;
		render.requireMaxState( MUNIT.RENDER_STATE_READ );
		assert.equal( 'state too large triggers error', stateSpy.count, 1 );
		assert.deepEqual( 'state error default args', stateSpy.args, [ render.requireMaxState ] );

		render.requireMaxState( MUNIT.RENDER_STATE_READ, munit.noop );
		assert.deepEqual( 'state error custom start func', stateSpy.args, [ munit.noop ] );

		// Reapply original state
		render.state = _state;
	},

	// Min state testing
	requireMinState: function( assert ) {
		var _state = render.state,
			stateSpy = assert.spy( render, '_stateError' );

		render.state = MUNIT.RENDER_STATE_READ;
		render.requireMinState( MUNIT.RENDER_STATE_DEFAULT );
		assert.equal( 'state error not triggered when state matches', stateSpy.count, 0 );

		render.state = MUNIT.RENDER_STATE_READ;
		render.requireMinState( MUNIT.RENDER_STATE_READ );
		assert.equal( 'equal states pass', stateSpy.count, 0 );

		render.state = MUNIT.RENDER_STATE_READ;
		render.requireMinState( MUNIT.RENDER_STATE_COMPILE );
		assert.equal( 'state too large triggers error', stateSpy.count, 1 );
		assert.deepEqual( 'state error default args', stateSpy.args, [ render.requireMinState ] );

		render.requireMinState( MUNIT.RENDER_STATE_COMPILE, munit.noop );
		assert.deepEqual( 'state error custom start func', stateSpy.args, [ munit.noop ] );

		// Reapply original state
		render.state = _state;
	},

	// Rendering 
	_renderNS: function( assert ) {
		var _tests = MUNIT.tests,
			focusSpy = assert.spy( render, 'focusPath', { returnValue: true } ),
			mod1 = new MUNIT.Assert( 'a.b.c.1' ),
			mod2 = new MUNIT.Assert( 'a.b.c.2' ),
			mod3 = new MUNIT.Assert( 'a.b.c.3' ),
			trigger1 = assert.spy( mod1, 'trigger' ),
			trigger2 = assert.spy( mod2, 'trigger' ),
			trigger3 = assert.spy( mod3, 'trigger' );

		// Additions when path is in focus
		MUNIT.tests = [];
		mod1.ns = { mod2: mod2 };
		render._renderNS({ mod1: mod1, mod3: mod3 });
		assert.greaterThan( 'mod1 added', MUNIT.tests.indexOf( mod1 ), -1 );
		assert.greaterThan( 'mod2 added', MUNIT.tests.indexOf( mod2 ), -1 );
		assert.greaterThan( 'mod3 added', MUNIT.tests.indexOf( mod3 ), -1 );
		assert.equal( 'mod1 trigger not called when path is not in focus', trigger1.count, 0 );
		assert.equal( 'mod2 trigger not called when path is not in focus', trigger2.count, 0 );
		assert.equal( 'mod3 trigger not called when path is not in focus', trigger3.count, 0 );

		// Additions when path is in focus
		focusSpy.option( 'returnValue', false );
		MUNIT.tests = [];
		mod1.ns = { mod2: mod2 };
		render._renderNS({ mod1: mod1, mod3: mod3 });
		assert.equal( 'mod1 not added when not in focus', MUNIT.tests.indexOf( mod1 ), -1 );
		assert.equal( 'mod2 not added when not in focus', MUNIT.tests.indexOf( mod2 ), -1 );
		assert.equal( 'mod3 not added when not in focus', MUNIT.tests.indexOf( mod3 ), -1 );
		assert.equal( 'mod1 trigger called when path is in focus', trigger1.count, 1 );
		assert.equal( 'mod2 trigger called when path is in focus', trigger2.count, 1 );
		assert.equal( 'mod3 trigger called when path is in focus', trigger3.count, 1 );

		// Re-apply tests
		MUNIT.tests = _tests;
	},

	// Dependency Check testing
	checkDepency: function( assert ) {
		var _state = render.state,
			_ns = MUNIT.ns;

		// Setup test dependency chain
		MUNIT.ns = {};
		MUNIT( 'a.b', { depends: 'g.f' } );
		MUNIT( 'a.b.c', { depends: 'e.f' } );
		MUNIT( 'a.b.d', { depends: 'a.b.c' } );
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

	// Render path setup
	_setup: function( assert ) {
		var normalizeSpy = assert.spy( render, '_normalizePath', { returnValue: '/a/b/c' } ),
			requireSpy = assert.spy( MUNIT, 'require' ),
			compileSpy = assert.spy( render, '_compile' ),
			exitSpy = assert.spy( MUNIT, 'exit' ),
			renderPathSpy = assert.spy( render, '_renderPath', {
				onCall: function( path, callback ) {
					callback( null );
				}
			}),
			error = new Error( 'munit.render Test Error' ),
			_options = MUNIT._options,

			// Filesystem spies
			isDirectory = true,
			exists = true,
			fs = require( 'fs' ),
			statSpy = assert.spy( fs, 'stat', {
				onCall: function( path, callback ) {
					callback( null, {
						isDirectory: function(){
							return isDirectory;
						}
					});
				}
			}),
			existsSpy = assert.spy( fs, 'exists', {
				onCall: function( path, callback ) {
					callback( exists );
				}
			});


		// Successful run through
		MUNIT._options = { render: '/a/b/c' };
		render._setup();
		assert.equal( 'path normalization triggered', normalizeSpy.count, 1 );
		assert.deepEqual( 'path normalization args', normalizeSpy.args, [ '/a/b/c' ] );
		assert.equal( 'fs.stat triggered', statSpy.count, 1 );
		assert.equal( 'fs.stat args path', statSpy.args[ 0 ], '/a/b/c' );
		assert.equal( 'fs.exists triggered for munit.js', existsSpy.count, 1 );
		assert.equal( 'fs.exists args path', existsSpy.args[ 0 ], '/a/b/c/munit.js' );
		assert.equal( 'munit.require triggered for munit.js', requireSpy.count, 1 );
		assert.equal( 'munit.require args path', requireSpy.args[ 0 ], '/a/b/c/munit.js' );
		assert.equal( 'render._renderPath triggered', renderPathSpy.count, 1 );
		assert.equal( 'render._renderPath args path', renderPathSpy.args[ 0 ], '/a/b/c' );
		assert.equal( 'munit.exit not triggered', exitSpy.count, 0 );
		assert.equal( 'compile triggered after all files required', compileSpy.count, 1 );

		// render with _renderPath error
		exists = false;
		renderPathSpy.option( 'onCall', function( path, callback ) {
			callback( error );
		});
		render._setup();
		assert.equal( '_renderPath error fs.stat triggered', statSpy.count, 2 );
		assert.equal( '_renderPath error fs.exists triggered for munit.js', existsSpy.count, 2 );
		assert.equal( '_renderPath error munit.require not triggered due to munit.js not existing', requireSpy.count, 1 );
		assert.equal( '_renderPath error render._renderPath triggered', renderPathSpy.count, 2 );
		assert.equal( '_renderPath error munit.exit triggered', exitSpy.count, 1 );
		assert.deepEqual( '_renderPath error munit.exit args', exitSpy.args, [ 1, error, "Unable to render test path" ] );
		assert.equal( '_renderPath error compile not triggered when error occurs', compileSpy.count, 1 );

		// render with stat not finding directory
		isDirectory = false;
		render._setup();
		assert.equal( 'test dir not dir - fs.stat triggered', statSpy.count, 3 );
		assert.equal( 'test dir not dir - munit.exit triggered', exitSpy.count, 2 );
		assert.deepEqual( 'test dir not dir - munit.exit args', exitSpy.args, [ 1, null, "'/a/b/c' is not a directory" ] );
		assert.equal( 'test dir not dir - fs.exists not triggered when stat fails', existsSpy.count, 2 );
		assert.equal( 'test dir not dir - compile not triggered when error occurs', compileSpy.count, 1 );

		// render with stat not finding directory
		isDirectory = true;
		statSpy.option( 'onCall', function( path, callback ) {
			callback( error );
		});
		render._setup();
		assert.equal( 'fs.stat error - fs.stat triggered', statSpy.count, 4 );
		assert.equal( 'fs.stat error - munit.exit triggered', exitSpy.count, 3 );
		assert.deepEqual( 'fs.stat error - munit.exit args', exitSpy.args, [ 1, error, "'/a/b/c' is not a directory" ] );
		assert.equal( 'fs.stat error - fs.exists not triggered when stat fails', existsSpy.count, 2 );
		assert.equal( 'fs.stat error - compile not triggered when error occurs', compileSpy.count, 1 );

		// Reset state
		MUNIT._options = _options;
	},

	// Compile testing and triggering
	_compile: function( assert ) {
		var _tests = MUNIT.tests,
			_state = render.state,
			requireSpy = assert.spy( render, 'requireState' ),
			renderSpy = assert.spy( render, '_renderNS' ),
			dependSpy = assert.spy( render, 'checkDepency', { returnValue: true } ),
			checkSpy = assert.spy( render, 'check' ),
			queueAddSpy = assert.spy( MUNIT.queue, 'addModule' ),
			mod1 = new MUNIT.Assert( 'a.b.c.1' ),
			mod2 = new MUNIT.Assert( 'a.b.c.2' ),
			mod3 = new MUNIT.Assert( 'a.b.c.3' ),
			trigger1 = assert.spy( mod1, 'trigger' ),
			trigger2 = assert.spy( mod2, 'trigger' ),
			trigger3 = assert.spy( mod3, 'trigger' );

		// Full run through
		mod1.options.priority = 0.1;
		mod2.options.priority = 0.2;
		mod2.options.queue = true;
		mod3.options.priority = 0.3;
		MUNIT.tests = [ mod2, mod1, mod3 ];
		render._compile();
		assert.equal( 'requireState triggered twice, once for init read state, and once for compile state', requireSpy.count, 2 );
		assert.deepEqual( 'first require trigger args (for read state)', requireSpy.history[ 0 ].args, [ MUNIT.RENDER_STATE_READ, render._compile ] );
		assert.deepEqual( 'second require trigger args (for compile state)', requireSpy.history[ 1 ].args, [ MUNIT.RENDER_STATE_COMPILE, render._compile ] );
		assert.equal( '_renderNS triggered once to line up all tests', renderSpy.count, 1 );
		assert.deepEqual( 'tests order based on priority', MUNIT.tests, [ mod3, mod2, mod1 ] );
		assert.equal( 'queue.addModule only triggered once for mod2', queueAddSpy.count, 1 );
		assert.deepEqual( 'queue.addModule args', queueAddSpy.args, [ mod2 ] );
		assert.equal( 'checkDepency triggered twice for non queue mods', dependSpy.count, 2 );
		assert.deepEqual( 'checkDepency first args (higher priority)', dependSpy.history[ 0 ].args, [ mod3 ] );
		assert.deepEqual( 'checkDepency second args (lower priority)', dependSpy.history[ 1 ].args, [ mod1 ] );
		assert.equal( 'mod3 triggered', trigger3.count, 1 );
		assert.equal( 'mod1 triggered', trigger1.count, 1 );
		assert.equal( 'mod2 not triggered due to being queued', trigger2.count, 0 );
		assert.equal( 'render.check triggered after all modules lined up', checkSpy.count, 1 );
		assert.equal( 'render state transitioned to active after all modules setup', render.state, MUNIT.RENDER_STATE_ACTIVE );

		// Make sure modules are not triggered when dependencies are not complete
		dependSpy.option( 'returnValue', false );
		render._compile();
		assert.equal( 'mod3 not triggered again', trigger3.count, 1 );
		assert.equal( 'mod1 not triggered again', trigger1.count, 1 );

		MUNIT.tests = _tests;
		render.state = _state;
	},

	// Test suite finalization
	_complete: function( assert ) {
		var requireSpy = assert.spy( render, 'requireState' ),
			exitSpy = assert.spy( MUNIT, 'exit' ),
			logSpy = assert.spy( MUNIT, 'log' ),
			redSpy = assert.spy( MUNIT.color.get, 'red' ),
			greenSpy = assert.spy( MUNIT.color.get, 'green' ),
			callbackSpy = assert.spy( render, 'callback' ),
			_state = render.state,
			_failed = MUNIT.failed;

		// Setup for successful completion
		MUNIT.failed = 0;
		render.state = MUNIT.RENDER_STATE_FINISHED;
		render._complete();
		assert.equal( 'requireState triggered', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.RENDER_STATE_FINISHED ] );
		assert.equal( 'green used for successful log result', greenSpy.count, 4 );
		assert.equal( 'red color not used in success', redSpy.count, 0 );
		assert.equal( 'success completed, logger triggered', logSpy.count, 1 );
		assert.equal( 'success completed, exit should not be called', exitSpy.count, 0 );
		assert.equal( 'munit render state switched to complete', render.state, MUNIT.RENDER_STATE_COMPLETE );
		assert.equal( 'render.callback triggered when finished', callbackSpy.count, 1 );
		assert.deepEqual( 'render.callback args', callbackSpy.args, [ null, MUNIT ] );
		assert.isUndefined( 'render.callback cleared after completion', render.callback );

		// Setup for failed completion
		MUNIT.failed = 5;
		render.callback = callbackSpy;
		render._complete();
		assert.equal( 'red used for failed log result', redSpy.count, 4 );
		assert.equal( 'green color not used in failure', greenSpy.count, 4 );
		assert.equal( 'error completed, logger triggered', logSpy.count, 2 );
		assert.equal( 'error completed, exit triggered', exitSpy.count, 1 );
		assert.deepEqual( 'error completed, exit args', exitSpy.args, [ 1, "Test failed with 5 errors" ] );
		assert.equal( "render.callback not triggered when there are errors", callbackSpy.count, 1 );
		assert.equal( 'render.callback left attached for munit.exit to deal with', render.callback, callbackSpy );

		// No errors, no callback
		MUNIT.failed = 0;
		render.callback = undefined;
		render._complete();
		assert.equal( 'no errors or callback - logger triggered', logSpy.count, 3 );
		assert.equal( 'no errors or callback - exit not triggered', exitSpy.count, 1 );
		assert.equal( "no errors or callback - callback not triggered when not attached", callbackSpy.count, 1 );

		// Restore defaults
		render.state = _state;
		MUNIT.failed = _failed;
	},

	// Rendering results tests
	_renderResults: function( assert ) {
		var completeSpy = assert.spy( render, '_complete' ),
			mkdirSpy = assert.spy( render, '_mkdir', {
				onCall: function( dir, callback ) {
					callback();
				}
			}),
			exitSpy = assert.spy( MUNIT, 'exit' ),
			spies = [],
			formatError = null;

		// Spy for each formatter
		render._formats.forEach(function( format ) {
			var spy = assert.spy( format, 'callback', {
				onCall: function( dir, callback ) {
					callback( formatError );
				}
			});
			spy.__formatName = format.name;
			spies.push( spy );
		});


		// Success path
		render._renderResults( '/a/b/c/' );
		assert.equal( 'mkdir triggered for each format, and the root results dir', mkdirSpy.count, render._formats.length + 1 );
		assert.equal( 'mkdir root results args path', mkdirSpy.history[ 0 ].args[ 0 ], '/a/b/c/' );
		spies.forEach(function( spy, index ) {
			var name = spy.__formatName;
			assert.equal( 'mkdir ' + index + ' args path ' + name, mkdirSpy.history[ index + 1 ].args[ 0 ], '/a/b/c/' + name + '/' );
			assert.equal( 'format ' + name + ' callback triggered', spy.count, 1 );
		});
		assert.equal( 'complete triggered', completeSpy.count, 1 );
		assert.equal( 'exit not triggered', exitSpy.count, 0 );

		// Format Error
		formatError = "Test Format Error";
		render._renderResults( '/a/b/c/' );
		assert.equal( 'exit triggered', exitSpy.count, 1 );
		assert.deepEqual( 'exit args', exitSpy.args, [ 1, "Test Format Error" ] );
		assert.equal( 'complete not triggered', completeSpy.count, 1 );

		// mkdir Error at format level
		mkdirSpy.option( 'onCall', function( dir, callback ) {
			if ( dir === '/a/b/c/' ) {
				callback();
			}
			else {
				callback( 'Test mkdir Error at Format Level' );
			}
		});
		render._renderResults( '/a/b/c/' );
		assert.equal( 'exit triggered for format mkdir error', exitSpy.count, 2 );
		assert.deepEqual( 'exit args for format mkdir error', exitSpy.args, [ 1, "Test mkdir Error at Format Level" ] );

		// mkdir Error at root results level
		mkdirSpy.option( 'onCall', function( dir, callback ) {
			if ( dir === '/a/b/c/' ) {
				callback( 'Test mkdir Error at Root Results' );
			}
			else {
				callback();
			}
		});
		render._renderResults( '/a/b/c/' );
		assert.equal( 'exit triggered for results mkdir error', exitSpy.count, 3 );
		assert.deepEqual( 'exit args for results mkdir error', exitSpy.args, [ 1, "Test mkdir Error at Root Results", "Failed to make root results directory" ] );
	},

	// Full test completion check testing
	check: function( assert ) {
		var normalizeSpy = assert.spy( render, '_normalizePath', { passthru: true } ),
			requireSpy = assert.spy( render, 'requireState' ),
			checkSpy = assert.spy( MUNIT.queue, 'check' ),
			resultsSpy = assert.spy( render, '_renderResults' ),
			completeSpy = assert.spy( render, '_complete' ),
			dependSpy = assert.spy( render, 'checkDepency', { returnValue: true } ),
			module = new MUNIT.Assert( 'core' ),
			optionSpy = assert.spy( module, 'option', { returnValue: null } ),
			triggerSpy = assert.spy( module, 'trigger' ),
			nowSpy = assert.spy( Date, 'now', { returnValue: 5342 } ),
			_state = render.state,
			_options = MUNIT._options,
			_tests = MUNIT.tests,
			_ns = MUNIT.ns,
			count = 0;

		// Full run through, no results printout
		MUNIT._options = {};
		MUNIT.ns = {};
		MUNIT.tests = [];
		MUNIT.end = 0;
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( '_normalizePath not triggered, no results dir', normalizeSpy.count, 0 );
		assert.equal( 'requireState triggered', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.RENDER_STATE_ACTIVE, render.check ] );
		assert.equal( 'all modules passed, no queue check', checkSpy.count, 0 );
		assert.equal( 'render state switched to finished for printout', render.state, MUNIT.RENDER_STATE_FINISHED );
		assert.equal( 'munit end time updated', MUNIT.end, 5342 );
		assert.equal( '_renderResults not triggered, no results dir', resultsSpy.count, 0 );
		assert.equal( '_complete triggered, no results dir', completeSpy.count, 1 );

		// Full run with results printout
		MUNIT._options = { results: "/a/b/c" };
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( '_normalizePath triggered', normalizeSpy.count, 1 );
		assert.deepEqual( '_normalizePath args', normalizeSpy.args, [ '/a/b/c' ] );
		assert.equal( '_complete not triggered when results dir exists', completeSpy.count, 1 );
		assert.equal( '_renderResults triggered with results dir option', resultsSpy.count, 1 );
		assert.deepEqual( '_renderResults args', resultsSpy.args, [ '/a/b/c/' ] );

		// Test non-finished path
		MUNIT.ns = { core: module };
		MUNIT.tests = [ module ];
		MUNIT._options = {};
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( '_complete not triggered when modules are not finished', completeSpy.count, 1 );
		assert.equal( '_renderResults not triggered when modules are not finished', resultsSpy.count, 1 );
		assert.equal( 'queue check triggered when modules are not finished', checkSpy.count, 1 );
		assert.equal( 'module option triggered for queue check', optionSpy.count, 1 );
		assert.deepEqual( 'module option args', optionSpy.args, [ 'queue' ] );
		assert.equal( 'render checkDepency triggered for queue check', dependSpy.count, 1 );
		assert.deepEqual( 'render checkDepency args', dependSpy.args, [ module ] );
		assert.equal( 'module triggered when in default state, passes dependencies, and has no queue object', triggerSpy.count, 1 );

		// Test non-finished path that doesn't pass dependency check
		dependSpy.option( 'returnValue', false );
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( 'queue check still triggered for dependency fail', checkSpy.count, 2 );
		assert.equal( 'module not triggered when dependencies not met', triggerSpy.count, 1 );

		// Test non-finished path that doesn't pass dependency check
		dependSpy.option( 'returnValue', true );
		optionSpy.option( 'returnValue', {} );
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( 'queue check still triggered for option queue return', checkSpy.count, 3 );
		assert.equal( 'module not triggered when module is in a queue', triggerSpy.count, 1 );

		// Test non-finished path that doesn't pass dependency check
		optionSpy.option( 'returnValue', null );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		render.state = MUNIT.RENDER_STATE_ACTIVE;
		render.check();
		assert.equal( 'queue check still triggered for module active state', checkSpy.count, 4 );
		assert.equal( 'module not triggered when module is already active', triggerSpy.count, 1 );

		// Quick return when render state is not active
		count = requireSpy.count;
		render.state = MUNIT.RENDER_STATE_DEFAULT;
		render.check();
		assert.equal( 'requireState not triggered when render state not active', requireSpy.count, count );

		// Reset
		render.state = _state;
		MUNIT._options = _options;
		MUNIT.tests = _tests;
		MUNIT.ns = _ns;
	}

});
