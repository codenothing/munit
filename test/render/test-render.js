var fs = require( 'fs' ),
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


// Normalize path testing
munit( 'render._normalizePath', function( assert ) {
	assert.isFunction( 'Method Exists', render._normalizePath );

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
});


// Recursive mkdir testing
munit( 'render._mkdir', 7, function( assert ) {
	assert.isFunction( 'Method Exists', render._mkdir );

	render._mkdir( __dirname, function( e ) {
		assert.empty( '__dirname should not throw any errors', e );
	});

	render._mkdir( __dirname + '/_mkdir/a/b/c', function( e ) {
		assert.empty( 'New path should not throw any errors', e );

		var path = __dirname;
		[ '_mkdir', 'a', 'b', 'c' ].forEach(function( dir ) {
			path += '/' + dir;
			fs.stat( path, function( e, stat ) {
				if ( ! stat || ! stat.isDirectory() ) {
					assert.fail( "mkdir depth, " + dir, null );
				}
				else {
					assert.pass( "mkdir depth, " + dir );
				}
			});
		});
	});

	render._mkdir( __filename, function( e ) {
		assert.isError( "Fail when creating directory on file", e );
	});
});


// Testing that string paths exist in the focus list
munit( 'render.focusPath', function( assert ) {
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
});


// State error testing
munit( 'render._stateError', function( assert ) {
	assert.isFunction( 'Method Exists', render._stateError );
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
});


// State error testing
munit( 'render.requireState', function( assert ) {
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
});


// State error testing
munit( 'render.requireMaxState', function( assert ) {
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
});


// State error testing
munit( 'render.requireMinState', function( assert ) {
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
});


// Dependency Check testing
munit( 'render.checkDepency', function( assert ) {
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
});


// Dependency Check testing
munit( 'render.check', function( assert ) {
	var _state = render.state,
		_options = MUNIT._options,
		_ns = MUNIT.ns,
		_queueCheck = MUNIT.queue.check,
		_mkdir = render._mkdir,
		_complete = render._complete;

	// Check should return without triggering anything when not in active state
	MUNIT.ns = {};
	MUNIT.queue.check = render._mkdir = render._complete = function(){
		assert.fail( "Default State Return" );
	};
	render.state = MUNIT.RENDER_STATE_DEFAULT;
	render.check();

	// Returns immediately as expected
	if ( ! assert.tests[ 'Default State Return' ] ) {
		assert.pass( 'Default State Return' );
	}

	// Check should throw when not in active state
	MUNIT.queue.check = render._mkdir = render._complete = function(){
		assert.fail( "Throw Non Active" );
	};
	render.state = MUNIT.RENDER_STATE_FINISHED;
	assert.throws( "Throw Non Active", /munit is rendering the results/, function(){
		render.check();
	});

	// Make sure render throws in non active state
	if ( ! assert.tests[ 'Throw Non Active' ] ) {
		assert.fail( 'Throw Non Active' );
	}

	// Test that we go through a check process when munit isn't finished
	// Note that we are relying on assert modules with queue option to not be triggered
	render.state = MUNIT.RENDER_STATE_DEFAULT;
	MUNIT( 'Main', { queue: true }, munit.noop ).state = MUNIT.ASSERT_STATE_ACTIVE;
	render._mkdir = render._complete = function(){
		assert.fail( 'Unfinished Check' );
	};
	MUNIT.queue.check = function(){
		assert.pass( 'Unfinished Check' );
	};
	render.state = MUNIT.RENDER_STATE_ACTIVE;
	render.check();

	// Make sure queue check gets triggered
	if ( ! assert.tests[ 'Unfinished Check' ] ) {
		assert.fail( 'Unfinished Check' );
	}

	// Test that mkdir gets triggered for junit test results when everything is finished
	render.state = MUNIT.RENDER_STATE_DEFAULT;
	MUNIT.ns = {};
	MUNIT._options = { junit: __dirname + '/fake-test-results/' };
	MUNIT( 'Main', { queue: true }, munit.noop ).state = MUNIT.ASSERT_STATE_FINISHED;
	MUNIT.queue.check = render._complete = function(){
		assert.fail( 'Finished Results _mkdir' );
	};
	render._mkdir = function(){
		assert.pass( 'Finished Results _mkdir' );
	};
	render.state = MUNIT.RENDER_STATE_ACTIVE;
	render.check();
	assert.equal( 'Finished Results _mkdir State', render.state, MUNIT.RENDER_STATE_FINISHED );

	// Make sure mkdir gets triggered
	if ( ! assert.tests[ 'Finished Results _mkdir' ] ) {
		assert.fail( 'Finished Results _mkdir' );
	}

	// Test that mkdir gets triggered for junit test results when everything is finished
	render.state = MUNIT.RENDER_STATE_DEFAULT;
	MUNIT.ns = {};
	MUNIT._options = {};
	MUNIT( 'Main', { queue: true }, munit.noop ).state = MUNIT.ASSERT_STATE_FINISHED;
	MUNIT.queue.check = render._mkdir = function(){
		assert.fail( 'Finished _complete' );
	};
	render._complete = function(){
		assert.pass( 'Finished _complete' );
	};
	render.state = MUNIT.RENDER_STATE_ACTIVE;
	render.check();
	assert.equal( 'Finished _complete State', render.state, MUNIT.RENDER_STATE_FINISHED );

	// Make sure mkdir gets triggered
	if ( ! assert.tests[ 'Finished _complete' ] ) {
		assert.fail( 'Finished _complete' );
	}

	// Reapply original states
	render.state = _state;
	render._mkdir = _mkdir;
	render._complete = _complete;
	MUNIT.queue.check = _queueCheck;
	MUNIT.ns = _ns;
	MUNIT._options = _options;
});
