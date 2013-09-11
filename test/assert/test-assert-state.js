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
		var module = MUNIT.Assert( 'a.b.c' ),
			stateSpy = assert.spy( module, '_stateError' );

		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.requireState( MUNIT.ASSERT_STATE_CLOSED );
		assert.equal( 'state error not triggered when state matches', stateSpy.count, 0 );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.requireState( MUNIT.ASSERT_STATE_CLOSED );
		assert.equal( 'state error triggered when state does not match', stateSpy.count, 1 );
		assert.deepEqual( 'state error args no startFunc', stateSpy.args, [ module.requireState ] );

		module.requireState( MUNIT.ASSERT_STATE_CLOSED, munit.noop );
		assert.deepEqual( 'state error with custom start func', stateSpy.args, [ munit.noop ] );
	},

	// Max state testing
	requireMaxState: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			stateSpy = assert.spy( module, '_stateError' );

		module.state = MUNIT.ASSERT_STATE_SETUP;
		module.requireMaxState( MUNIT.ASSERT_STATE_ACTIVE );
		assert.equal( 'state error not triggered when state matches', stateSpy.count, 0 );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.requireMaxState( MUNIT.ASSERT_STATE_ACTIVE );
		assert.equal( 'equal states pass', stateSpy.count, 0 );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.requireMaxState( MUNIT.ASSERT_STATE_SETUP );
		assert.equal( 'state too large triggers error', stateSpy.count, 1 );
		assert.deepEqual( 'state error default args', stateSpy.args, [ module.requireMaxState ] );

		module.requireMaxState( MUNIT.ASSERT_STATE_SETUP, munit.noop );
		assert.deepEqual( 'state error custom start func', stateSpy.args, [ munit.noop ] );
	},

	// Min state testing
	requireMinState: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			stateSpy = assert.spy( module, '_stateError' );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.requireMinState( MUNIT.ASSERT_STATE_SETUP );
		assert.equal( 'state error not triggered when state matches', stateSpy.count, 0 );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.requireMinState( MUNIT.ASSERT_STATE_ACTIVE );
		assert.equal( 'equal states pass', stateSpy.count, 0 );

		module.state = MUNIT.ASSERT_STATE_SETUP;
		module.requireMinState( MUNIT.ASSERT_STATE_ACTIVE );
		assert.equal( 'state too large triggers error', stateSpy.count, 1 );
		assert.deepEqual( 'state error default args', stateSpy.args, [ module.requireMinState ] );

		module.requireMinState( MUNIT.ASSERT_STATE_ACTIVE, munit.noop );
		assert.deepEqual( 'state error custom start func', stateSpy.args, [ munit.noop ] );
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

	// Full _close method tests
	_close: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			submod = MUNIT.Assert( 'a.b.c.d' ),
			subCloseSpy = assert.spy( submod, 'close' ),
			failSpy = assert.spy( module, '_fail' ),
			queueSpy = assert.spy( MUNIT.queue, 'add' ),
			focusSpy = assert.spy( MUNIT.render, 'focusPath', { returnValue: true } ),
			finishSpy = assert.spy( module, 'finish' ),
			queue = {};

		// Module test setup
		module.options = { expect: 0, autoQueue: true };
		module.count = 1;
		module.ns = {};
		module.queue = queue;
		module._timeid = setTimeout( munit.noop, 1000 );

		// Successful run without any extra failures or tree closures
		module._close( munit.noop, false );
		assert.equal( '_fail not triggered with tests recorded', failSpy.count, 0 );
		assert.equal( 'render.focusPath not triggered with tests recorded', focusSpy.count, 0 );
		assert.equal( 'queue.add triggered with tests recorded and queue used', queueSpy.count, 1 );
		assert.isUndefined( 'module timer undefined after clear', module._timeid );
		assert.isNull( 'module.queue null after autoQueue', module.queue );
		assert.equal( 'finish triggered with tests recorded and no sub modules', finishSpy.count, 1 );
		assert.deepEqual( 'finish args of start function and forced close', finishSpy.args, [ munit.noop, false ] );

		// still finish when submodules exist that are complete
		module.ns = { d: submod };
		submod.state = MUNIT.ASSERT_STATE_CLOSED;
		module._close();
		assert.equal( '_fail still not triggered with tests recorded', failSpy.count, 0 );
		assert.equal( 'submod not closed when it is already closed', subCloseSpy.count, 0 );
		assert.equal( 'finish still triggered with closed submodules', finishSpy.count, 2 );

		// Close out submodule when forced
		submod.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._close( munit.noop, true );
		assert.equal( 'submod force closed when told to', subCloseSpy.count, 1 );
		assert.deepEqual( 'submod force closed args', subCloseSpy.args, [ munit.noop, true ] );
		assert.equal( 'finish still triggered when force closing submodules', finishSpy.count, 3 );

		// Quick return if submodule isn't closed, and not forced
		submod.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._close();
		assert.equal( 'submod not closed when not forced', subCloseSpy.count, 1 );
		assert.equal( 'finish not triggered when not forced to close out submodules', finishSpy.count, 3 );

		// Test failure when no tests are added
		module.ns = {};
		module.options = { expect: 0 };
		module.count = 0;
		module._close();
		assert.equal( '_fail triggered when no tests are ran', failSpy.count, 1 );
		assert.deepEqual( '_fail args when no tests are found', failSpy.args, [ 'No Tests Found', module._close, 'Module closed without any tests being ran.' ] );
		assert.equal( 'finish still triggered when no tests cause _fail trigger', finishSpy.count, 4 );

		// Test non failure when no tests are added to non-focused module
		focusSpy.option( 'returnValue', false );
		module._close();
		assert.equal( '_fail not triggered when module not in focus', failSpy.count, 1 );
		assert.equal( 'finish still triggered when there are no tests and module is not in focus', finishSpy.count, 5 );

		// Test failure when more tests are expected
		focusSpy.option( 'returnValue', true );
		module.options = { expect: 5 };
		module.count = 3;
		module._close();
		assert.equal( '_fail triggered when not enough tests are ran', failSpy.count, 2 );
		assert.deepEqual( '_fail args when not enough tests are found', failSpy.args, [ 'Unexpected End', module._close, 'Expecting 5 tests, only 3 ran.' ] );
		assert.equal( 'finish still triggered when not enough tests cause _fail trigger', finishSpy.count, 6 );

		// Test non failure when no tests are added to non-focused module
		focusSpy.option( 'returnValue', false );
		module._close();
		assert.equal( "_fail not triggered when there aren't enough tests and module not in focus", failSpy.count, 2 );
		assert.equal( "finish still triggered when there aren't enough tests and module is not in focus", finishSpy.count, 7 );

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
