munit( 'assert.state', { priority: munit.PRIORITY_HIGHER }, {

	// State error testing
	_stateError: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		// Starting state should be the default state
		assert.equal( 'Starting Default State', MUNIT.ASSERT_STATE_DEFAULT, module.state );

		// Ensure the correct error is thrown on each state
		[

			{
				name: 'Default State Error',
				state: MUNIT.ASSERT_STATE_DEFAULT,
				match: /'a.b.c' hasn't been triggered yet/
			},

			{
				name: 'Setup State Error',
				state: MUNIT.ASSERT_STATE_SETUP,
				match: /'a.b.c' is in the setup processs/
			},

			{
				name: 'Active State Error',
				state: MUNIT.ASSERT_STATE_ACTIVE,
				match: /'a.b.c' is active/
			},

			{
				name: 'Teardown State Error',
				state: MUNIT.ASSERT_STATE_TEARDOWN,
				match: /'a.b.c' is in the teardown processs/
			},

			{
				name: 'Closed State Error',
				state: MUNIT.ASSERT_STATE_CLOSED,
				match: /'a.b.c' is closed/
			},

			{
				name: 'Finished State Error',
				state: MUNIT.ASSERT_STATE_FINISHED,
				match: /'a.b.c' is finished/
			},

			{
				name: 'Unknown State Error',
				state: -42,
				match: /'a.b.c' is in an unknown state/
			}

		].forEach(function( object ) {
			module.state = object.state;
			assert.throws( object.name, object.match, function(){
				module._stateError();
			});
		});
	},

	// State error testing
	requireState: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		module.state = MUNIT.ASSERT_STATE_CLOSED;
		assert.doesNotThrow( 'State Matches', function(){
			module.requireState( MUNIT.ASSERT_STATE_CLOSED );
		});

		module.state = MUNIT.ASSERT_STATE_FINISHED;
		assert.throws( "State Doesn't Match", /'a.b.c' is finished/, function(){
			module.requireState( MUNIT.ASSERT_STATE_CLOSED );
		});
	},

	// Max state testing
	requireMaxState: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		module.state = MUNIT.ASSERT_STATE_SETUP;
		assert.doesNotThrow( 'Passing', function(){
			module.requireMaxState( MUNIT.ASSERT_STATE_ACTIVE );
		});

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( "Equal states pass", function(){
			module.requireMaxState( MUNIT.ASSERT_STATE_ACTIVE );
		});

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.throws( "State too large", /'a.b.c' is active/, function(){
			module.requireMaxState( MUNIT.ASSERT_STATE_SETUP );
		});
	},

	// Min state testing
	requireMinState: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( 'Passing', function(){
			module.requireMinState( MUNIT.ASSERT_STATE_SETUP );
		});

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( "Equal states pass", function(){
			module.requireMinState( MUNIT.ASSERT_STATE_ACTIVE );
		});

		module.state = MUNIT.ASSERT_STATE_SETUP;
		assert.throws( "State too small", /'a.b.c' is in the setup processs/, function(){
			module.requireMinState( MUNIT.ASSERT_STATE_ACTIVE );
		});
	},

	// Setup path testing
	_setup: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			callback = assert.spy();

		// Sanity check
		assert.isFunction( 'method exists', module._setup );

		// Throw an error when attempting to setup in non default state
		module.state = MUNIT.ASSERT_STATE_SETUP;
		assert.throws( "Can only setup in default state", /'a.b.c' is in the setup processs/, function(){
			module._setup( munit.noop );
		});

		// Check flow of non-optional setup
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		assert.doesNotThrow( "_setup trigger", function(){
			module._setup( callback );
		});

		// Module jumps to active state on non-optional setup
		assert.equal( '_setup callback triggered', callback.count, 1 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_ACTIVE );
	},

	// Setup with option path testing
	'_setup option': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			callback = assert.spy(),
			setupSpy = assert.spy( module.options, 'setup', {
				onCall: function( module, callback ) {
					assert.equal( 'setup state', module.state, MUNIT.ASSERT_STATE_SETUP );
					callback();
				}
			});

		// Trigger setup
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		assert.doesNotThrow( "_setup trigger", function(){
			module._setup( callback );
		});

		// Make sure callback was triggered and state changed correctly
		assert.equal( 'setup triggered', setupSpy.count, 1 );
		assert.equal( '_setup callback triggered', callback.count, 1 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_ACTIVE );
	},

	// Teardown path testing
	_teardown: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			callback = assert.spy();

		// Sanity check
		assert.isFunction( 'method exists', module._teardown );

		// Throw an error when attempting to teardown in non active state
		module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		assert.throws( "Can only teardown in active state", /'a.b.c' is in the teardown processs/, function(){
			module._teardown( munit.noop );
		});

		// Check flow of non-optional teardown
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( "_teardown trigger", function(){
			module._teardown( callback );
		});

		assert.equal( '_teardown callback triggered', callback.count, 1 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_CLOSED );
	},

	// Teardown with option path testing
	'_teardown option': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			callback = assert.spy(),
			teardownSpy = assert.spy( module.options, 'teardown', {
				onCall: function( module, callback ) {
					assert.equal( 'teardown state', module.state, MUNIT.ASSERT_STATE_TEARDOWN );
					callback();
				}
			});

		// Trigger teardown
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( "_teardown trigger", function(){
			module._teardown( callback );
		});
		assert.equal( 'teardown triggered', teardownSpy.count, 1 );
		assert.equal( '_teardown callback triggered', callback.count, 1 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_CLOSED );
	},

	// Sync trigger testing
	'trigger sync': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			callback = assert.spy( module, 'callback' ),
			closeSpy = assert.spy( module, 'close' );

		// Track method invoking
		module.trigger();
		assert.isFalse( 'Non Async', module.isAsync );
		assert.equal( 'test callback triggered', callback.count, 1 );
		assert.deepEqual( 'test callback arguments', callback.args, [ module ] );
		assert.greaterThan( 'module.start set', module.start, 0 );
		assert.equal( 'end time should match start', module.start, module.end );
		assert.equal( 'close triggered', closeSpy.count, 1 );
	},

	// Async trigger tests with expect
	'trigger async expect': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c', null, { expect: 1, timeout: 20 } ), afterTrigger = false;
		assert.option( 'expect', 2 );

		// Synchronous trigger
		module.callback = munit.noop;
		module.close = function(){
			assert.ok( 'Async Timeout Triggered', afterTrigger );
		};
		module.trigger();
		afterTrigger = true;
		assert.isTrue( 'Is Async', module.isAsync );

		// Fail out if close not triggered from timeout
		setTimeout(function(){
			if ( ! assert.tests[ 'Async Timeout Triggered' ] ) {
				assert.fail( 'Async Timeout Triggered' );
			}
		}, 25);
	},

	// Async trigger test with isAsync
	'trigger on isAsync true': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c', null, { isAsync: true, timeout: 20 } ), afterTrigger = false;
		assert.option( 'expect', 2 );

		// Synchronous trigger
		module.callback = munit.noop;
		module.close = function(){
			assert.ok( 'Async Timeout Triggered', afterTrigger );
		};
		module.trigger();
		afterTrigger = true;
		assert.isTrue( 'Is Async', module.isAsync );

		// Fail out if close not triggered from timeout
		setTimeout(function(){
			if ( ! assert.tests[ 'Async Timeout Triggered' ] ) {
				assert.fail( 'Async Timeout Triggered' );
			}
		}, 25);
	},

	// Async trigger test with an error
	'trigger error': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c', null, { isAsync: true, timeout: 0 } );
		module.callback = module.close = munit.noop;
		assert.throws( "Timeout not set with isAsync", /No timeout specified for async test 'a.b.c'/, function(){
			module.trigger();
		});


		module = MUNIT.Assert( 'a.b.c', null, { expect: 1, timeout: 0 } );
		module.callback = module.close = munit.noop;
		assert.throws( "Timeout not set with expect", /No timeout specified for async test 'a.b.c'/, function(){
			module.trigger();
		});
	},

	// Trigger with auto close
	'trigger auto close': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			closeSpy = assert.spy( module, '_close' ),
			callback = assert.spy();

		// Overwrite options
		assert.spy( MUNIT, '_options' );

		// Module auto close when there is no callback
		module.callback = null;
		module.trigger();
		assert.equal( 'No callback _close triggered', closeSpy.count, 1 );
		assert.equal( 'No callback close state', module.state, MUNIT.ASSERT_STATE_CLOSED );

		// Modules should also auto close when it's not part of the focus
		MUNIT._options = { focus: [ 'e.f' ] };
		module = MUNIT.Assert( 'a.b.c' );
		module.callback = callback;
		closeSpy = assert.spy( module, '_close' );
		module.trigger();
		assert.equal( "callback shouldn't get called on non-focus path", callback.count, 0 );
		assert.equal( "Focus auto _close triggered", closeSpy.count, 1 );
		assert.equal( 'Focus Auto Close State', module.state, MUNIT.ASSERT_STATE_CLOSED );
	},

	// Close tests
	close: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			closeSpy = assert.spy( module, '_close' ),
			teardownSpy = assert.spy( module, '_teardown', {
				onCall: function( callback ) {
					callback();
				}
			});

		module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		assert.throws( 'Throws error when not in active state', /'a.b.c' is in the teardown processs/, function(){
			module.close();
		});

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		assert.doesNotThrow( 'close call', function(){
			module.close( munit.noop, true );
		});
		assert.equal( '_teardown triggered', teardownSpy.count, 1 );
		assert.equal( '_close triggered', closeSpy.count, 1 );
		assert.deepEqual( '_close arguments', closeSpy.args, [ munit.noop, true ] );
	},

	// Close to finish path
	'close to finish': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			addSpy = assert.spy( MUNIT.queue, 'add' ),
			finishSpy = assert.spy( module, 'finish' ),
			object = { port: 1234 };

		// Setup module for full close path test
		module.queue = object;
		module._timeid = setTimeout( munit.noop, 1000 );
		module.end = 0;
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.options.autoQueue = true;

		// Module should be in correct state, but test just in case
		assert.doesNotThrow( 'close call', function(){
			module.close( munit.noop, false );
		});
		assert.equal( 'queue.add triggered', addSpy.count, 1 );
		assert.deepEqual( 'queue.add args', addSpy.args, [ object ] );
		assert.equal( 'finish triggered', finishSpy.count, 1 );
		assert.deepEqual( 'finish args', finishSpy.args, [ munit.noop, false ] );

		// After trigger tests
		assert.equal( 'queue null', module.queue, null );
		assert.equal( 'timeid cleared', module._timeid, undefined );
		assert.ok( 'end time set', module.end > 0 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_CLOSED );
	},

	// Closing module not on focus path testing
	'_close on non-focus': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			failSpy = assert.spy( module, '_fail' );

		// Auto revert global options once module completes
		assert.spy( MUNIT, '_options' );

		// Base test to ensure internal _fail call gets triggered properly
		module.options.expect = 2;
		module.count = 0;
		module.finish = munit.noop;
		module._close();
		assert.equal( 'base _fail triggered', failSpy.count, 1 );

		// Setup focus test
		MUNIT._options = { focus: [ 'e.f' ] };
		module._close();
		assert.equal( '_fail not triggered when module not in focus', failSpy.count, 1 );
	},

	// Finish tests
	finish: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			flushSpy = assert.spy( module, '_flush' );

		// Check that non closed states throws an error
		module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		assert.throws( 'Throws error when not in closed state', /'a.b.c' is in the teardown processs/, function(){
			module.finish();
		});

		// Module should be in correct state, but test just in case
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		assert.doesNotThrow( 'finish call', function(){
			module.finish( munit.noop, true );
		});
		assert.equal( '_flush triggered', flushSpy.count, 1 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_FINISHED );
	},

	// Forced finish testing
	'finish force': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			checkSpy = assert.spy( MUNIT.render, 'check' ),
			flushSpy = assert.spy( module, '_flush' );

		// Module should be in correct state, but test just in case
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		assert.doesNotThrow( 'finish call', function(){
			module.finish();
		});
		assert.equal( '_flush triggered', flushSpy.count, 1 );
		assert.equal( 'render.check triggered', checkSpy.count, 1 );
		assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_FINISHED );
	},

	// Forced finish with focus ignore
	'finish focus': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			checkSpy = assert.spy( MUNIT.render, 'check' ),
			flushSpy = assert.spy( module, '_flush' );

		// Auto revert global options once module finishes
		assert.spy( MUNIT, '_options' );

		// Setup base test case to ensure _flush gets called correctly
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish();
		assert.equal( 'base _flush triggered', flushSpy.count, 1 );
		assert.equal( 'render.check triggered', checkSpy.count, 1 );

		// Setup test case to not trigger _flush internally
		MUNIT._options = { focus: [ 'e.f' ] };
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish();
		assert.equal( '_flush not triggered because module not in focus', flushSpy.count, 1 );
		assert.equal( 'render.check still called', checkSpy.count, 2 );
	}

});
