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
			requireSpy = assert.spy( module, 'requireState' ),
			callback = assert.spy(),
			error = new Error( "Test _setup Error" ),
			setupSpy = assert.spy({
				onCall: function( module, callback ) {
					assert.equal( 'state transitioned to setup', module.state, MUNIT.ASSERT_STATE_SETUP );
					callback();
				}
			});

		// Sanity check
		assert.isFunction( 'method exists', module._setup );

		// Run with custom setup
		module.options.setup = setupSpy;
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		module._setup( callback );
		assert.equal( 'requireState triggered, once for default, once for setup', requireSpy.count, 2 );
		assert.deepEqual( 'requireState triggered first (default) args', requireSpy.history[ 0 ].args, [ MUNIT.ASSERT_STATE_DEFAULT, module._setup ] );
		assert.equal( 'requireState triggered second (setup) arg state', requireSpy.history[ 1 ].args[ 0 ], MUNIT.ASSERT_STATE_SETUP );
		assert.isFunction( 'requireState triggered second (setup) arg callback', requireSpy.history[ 1 ].args[ 1 ] );
		assert.equal( 'options.setup triggered', setupSpy.count, 1 );
		assert.equal( 'callback triggered after setup complete', callback.count, 1 );
		assert.equal( 'callback clean args', callback.args[ 0 ], undefined );
		assert.isFunction( 'callback clean args setupFunc', callback.args[ 1 ] );
		assert.equal( 'state transitioned to acive', module.state, MUNIT.ASSERT_STATE_ACTIVE );

		// Run with custom setup error
		setupSpy.option( 'onCall', function( module, callback ) {
			callback( error );
		});
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		module._setup( callback );
		assert.equal( 'requireState triggered again, once for default, once for setup', requireSpy.count, 4 );
		assert.equal( 'options.setup triggered for setup error', setupSpy.count, 2 );
		assert.equal( 'callback triggered after setup error', callback.count, 2 );
		assert.equal( 'callback setup error args error', callback.args[ 0 ], error );
		assert.isFunction( 'callback setup error args setupFunc', callback.args[ 1 ] );
		assert.equal( 'state still transitioned to acive in setup error', module.state, MUNIT.ASSERT_STATE_ACTIVE );

		// Run without custom setup
		module.options.setup = null;
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		module._setup( callback );
		assert.equal( 'requireState only triggered once, for default', requireSpy.count, 5 );
		assert.equal( 'options.setup not triggered', setupSpy.count, 2 );
		assert.equal( 'callback still triggered', callback.count, 3 );
		assert.equal( 'state still transitioned to acive', module.state, MUNIT.ASSERT_STATE_ACTIVE );
	},

	// Teardown path testing
	_teardown: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			requireSpy = assert.spy( module, 'requireState' ),
			callback = assert.spy(),
			teardownSpy = assert.spy({
				onCall: function( module, callback ) {
					assert.equal( 'state transitioned to teardown', module.state, MUNIT.ASSERT_STATE_TEARDOWN );
					callback();
				}
			});

		// Sanity check
		assert.isFunction( 'method exists', module._teardown );

		// Run with custom setup
		module.options.teardown = teardownSpy;
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._teardown( callback );
		assert.equal( 'requireState triggered, once for active, once for teardown', requireSpy.count, 2 );
		assert.deepEqual( 'requireState triggered first (active) args', requireSpy.history[ 0 ].args, [ MUNIT.ASSERT_STATE_ACTIVE, module._teardown ] );
		assert.equal( 'requireState triggered second (teardown) arg state', requireSpy.history[ 1 ].args[ 0 ], MUNIT.ASSERT_STATE_TEARDOWN );
		assert.isFunction( 'requireState triggered second (teardown) arg callback', requireSpy.history[ 1 ].args[ 1 ] );
		assert.equal( 'options.teardown triggered', teardownSpy.count, 1 );
		assert.equal( 'callback triggered after teardown complete', callback.count, 1 );
		assert.equal( 'state transitioned to closed', module.state, MUNIT.ASSERT_STATE_CLOSED );

		// Run without custom setup
		module.options.teardown = null;
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._teardown( callback );
		assert.equal( 'requireState only triggered once, for active', requireSpy.count, 3 );
		assert.equal( 'options.teardown not triggered', teardownSpy.count, 1 );
		assert.equal( 'callback still triggered', callback.count, 2 );
		assert.equal( 'state still transitioned to closed', module.state, MUNIT.ASSERT_STATE_CLOSED );
	},

	// Trigger testing
	trigger: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			requireSpy = assert.spy( module, 'requireState' ),
			nowSpy = assert.spy( Date, 'now', { returnValue: 4231 } ),
			focusSpy = assert.spy( MUNIT.render, 'focusPath', { returnValue: true } ),
			failSpy = assert.spy( module, 'fail' ),
			_closeSpy = assert.spy( module, '_close' ),
			callbackSpy = assert.spy( module, 'callback' ),
			closeSpy = assert.spy( module, 'close' ),
			queue = { queueObject: true },
			error = new Error( "Test Trigger Error" ),
			setupSpy = assert.spy( module, '_setup', {
				onCall: function( callback ) {
					callback();
				}
			}),
			timeoutSpy = assert.spy( global, 'setTimeout', {
				onCall: function( callback, time ) {
					callback();
					return 9182746;
				}
			});

		// Full synchronous trigger path
		module.start = module.end = 0;
		module.queue = queue;
		module.options = { timeout: 0 };
		module.trigger();
		assert.equal( 'requireState triggered to ensure default state', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.ASSERT_STATE_DEFAULT, module.trigger ] );
		assert.equal( 'start time', module.end, 4231 );
		assert.equal( 'end time should match start', module.end, 4231 );
		assert.equal( 'render.focusPath triggered since callback exists', focusSpy.count, 1 );
		assert.equal( 'setup triggered', setupSpy.count, 1 );
		assert.equal( 'module.callback triggered', callbackSpy.count, 1 );
		assert.deepEqual( 'module.callback args', callbackSpy.args, [ module, queue ] );
		assert.equal( 'close triggered when not async', closeSpy.count, 1 );
		assert.equal( 'timeout not triggered in synchronous module', timeoutSpy.count, 0 );

		// Full asynchronous trigger path
		module.options = { timeout: 1000 };
		module.queue = null;
		module.trigger();
		assert.equal( 'render.focusPath triggered in async tests', focusSpy.count, 2 );
		assert.equal( 'setup still triggered in async tests', setupSpy.count, 2 );
		assert.equal( 'module.callback still triggered in async tests', callbackSpy.count, 2 );
		assert.deepEqual( 'module.callback async args (null queue)', callbackSpy.args, [ module, null ] );
		assert.equal( 'timeout triggered in async module', timeoutSpy.count, 1 );
		assert.isFunction( 'timeout callback argument', timeoutSpy.args[ 0 ] );
		assert.equal( 'timeout time argument', timeoutSpy.args[ 1 ], 1000 );
		assert.equal( 'module timeid set with return of setTimeout', module._timeid, 9182746 );
		assert.equal( 'close still triggered with async module, and time runs out', closeSpy.count, 2 );

		// Async module closes before timeout callback is triggered
		timeoutSpy.option( 'onCall', function( callback, time ) {
			module.state = MUNIT.ASSERT_STATE_TEARDOWN;
			callback();
		});
		module.trigger();
		assert.equal( 'render.focusPath triggered in no close async test', focusSpy.count, 3 );
		assert.equal( 'setup still triggered in no close async test', setupSpy.count, 3 );
		assert.equal( 'module.callback still triggered in no close async test', callbackSpy.count, 3 );
		assert.equal( 'timeout triggered again for no close async test', timeoutSpy.count, 2 );
		assert.equal( 'close not triggered when time runs out, and test is already past active state', closeSpy.count, 2 );

		// Test module closing inside callback
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		callbackSpy.option( 'onCall', function(){
			module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		});
		module.trigger();
		assert.equal( 'render.focusPath triggered in already closed test', focusSpy.count, 4 );
		assert.equal( 'setup still triggered in already closed test', setupSpy.count, 4 );
		assert.equal( 'module.callback still triggered in already closed test', callbackSpy.count, 4 );
		assert.equal( 'timeout not triggered when module already closed in process', timeoutSpy.count, 2 );
		assert.equal( 'close not triggered when module already closed in process', closeSpy.count, 2 );


		// Test setup returning an error and forcing a close of the module
		setupSpy.option( 'onCall', function( callback ) {
			callback( error, munit.noop );
		});
		module.trigger();
		assert.equal( 'render.focusPath triggered in setup error test', focusSpy.count, 5 );
		assert.equal( 'setup still triggered in setup error test', setupSpy.count, 5 );
		assert.equal( 'fail triggered in setup error test', failSpy.count, 1 );
		assert.deepEqual( 'fail args', failSpy.args, [ "[munit] Failed to setup module", munit.noop, error ] );
		assert.equal( 'close triggered when setup fails', closeSpy.count, 3 );

		// Test quick close for modules not in focus
		focusSpy.option( 'returnValue', false );
		module.trigger();
		assert.equal( 'render.focusPath triggered for module not in focus test', focusSpy.count, 6 );
		assert.equal( 'state changed to closed for quick exit', module.state, MUNIT.ASSERT_STATE_CLOSED );
		assert.equal( '_close triggered directly when doing a quick exit from module not in focus', _closeSpy.count, 1 );
		assert.equal( 'setup not triggered when module is not in focus', setupSpy.count, 5 );
		assert.equal( 'callback not triggered when module is not in focus', callbackSpy.count, 4 );

		// Test no callback applied quick close
		module.state = MUNIT.ASSERT_STATE_DEFAULT;
		module.trigger();
		assert.equal( 'render.focusPath not triggered when no callback is defined', focusSpy.count, 7 );
		assert.equal( 'state changed to closed for no callback defined', module.state, MUNIT.ASSERT_STATE_CLOSED );
		assert.equal( '_close triggered directly when doing a quick exit from no callback defined', _closeSpy.count, 2 );
		assert.equal( 'setup not triggered when no callback is defined', setupSpy.count, 5 );
	},

	// Close tests
	close: function( assert ) {
		var module = new MUNIT.Assert( 'a.b.c' ),
			requireSpy = assert.spy( module, 'requireState' ),
			closeSpy = assert.spy( module, '_close' ),
			failSpy = assert.spy( module, 'fail' ),
			order = 0,
			restoreSpy1 = assert.spy({
				onCall: function(){
					restoreSpy1.__order = ++order;
				}
			}),
			restoreSpy2 = assert.spy({
				onCall: function(){
					restoreSpy2.__order = ++order;
				}
			}),
			teardownSpy = assert.spy( module, '_teardown', {
				onCall: function( callback ) {
					callback();
				}
			});

		// Full run through with custom start function
		module._spies = [ { restore: restoreSpy1 }, { restore: restoreSpy2 } ];
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.count = 0;
		module.close( munit.noop, true );
		assert.equal( 'requireState triggered', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.ASSERT_STATE_ACTIVE, module.close ] );
		assert.equal( 'fail triggered when no tests run', failSpy.count, 1 );
		assert.deepEqual( 'fail args', failSpy.args, [ "[munit] No tests ran in this module" ] );
		assert.equal( 'restoreSpy2 triggered', restoreSpy2.count, 1 );
		assert.equal( 'restoreSpy2 triggered first', restoreSpy2.__order, 1 );
		assert.equal( 'restoreSpy1 triggered', restoreSpy1.count, 1 );
		assert.equal( 'restoreSpy1 triggered last', restoreSpy1.__order, 2 );
		assert.equal( '_teardown triggered', teardownSpy.count, 1 );
		assert.equal( '_close triggered', closeSpy.count, 1 );
		assert.deepEqual( '_close arguments', closeSpy.args, [ munit.noop, true ] );

		// Test full run without custom start function
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module.count = 1;
		module.close();
		assert.equal( 'fail not triggered when count exists', failSpy.count, 1 );
		assert.equal( '_close triggered no custom startFunc', closeSpy.count, 2 );
		assert.deepEqual( '_close arguments no custom startFunc', closeSpy.args, [ module.close, undefined ] );
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
		module.callback = munit.noop;
		module._close();
		assert.equal( '_fail triggered when no tests are ran', failSpy.count, 1 );
		assert.deepEqual( '_fail args when no tests are found', failSpy.args, [ '[munit] No Tests Found', module._close, 'Module closed without any tests being ran.' ] );
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
		assert.deepEqual( '_fail args when not enough tests are found', failSpy.args, [ '[munit] Unexpected End', module._close, 'Expecting 5 tests, only 3 ran.' ] );
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
			submod = MUNIT.Assert( 'a.b.c.d' ),
			subCloseSpy = assert.spy( submod, 'close' ),
			parAssert = MUNIT.Assert( 'a.b' ),
			parFinishSpy = assert.spy( parAssert, 'finish' ),
			requireSpy = assert.spy( module, 'requireState' ),
			focusSpy = assert.spy( MUNIT.render, 'focusPath', { returnValue: true } ),
			flushSpy = assert.spy( module, '_flush' ),
			checkSpy = assert.spy( MUNIT.render, 'check' );

		// Forced path
		module.parAssert = null;
		module.ns = { d: submod };
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish( munit.noop, true );
		assert.equal( 'requireState triggered', requireSpy.count, 1 );
		assert.deepEqual( 'requireState args', requireSpy.args, [ MUNIT.ASSERT_STATE_CLOSED, munit.noop ] );
		assert.equal( 'module state changed to finished', module.state, MUNIT.ASSERT_STATE_FINISHED );
		assert.equal( 'submod close triggered', subCloseSpy.count, 1 );
		assert.deepEqual( 'submod close args', subCloseSpy.args, [ munit.noop, true ] );
		assert.equal( 'focus triggered to flush results if in focus', focusSpy.count, 1 );
		assert.equal( 'flush triggered because module is in focus', flushSpy.count, 1 );
		assert.equal( 'parent finish not triggered when not forced', parFinishSpy.count, 0 );
		assert.equal( 'render check not triggered when not forced', checkSpy.count, 0 );

		// Non-forced path
		focusSpy.option( 'returnValue', false );
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish();
		assert.equal( 'requireState still triggered', requireSpy.count, 2 );
		assert.deepEqual( 'requireState args without custom start function', requireSpy.args, [ MUNIT.ASSERT_STATE_CLOSED, module.finish ] );
		assert.equal( 'submod close still triggered', subCloseSpy.count, 2 );
		assert.deepEqual( 'submod close args without custom start function', subCloseSpy.args, [ module.finish, true ] );
		assert.equal( 'focus still triggered to test flush results in focus', focusSpy.count, 2 );
		assert.equal( 'flush not triggered because module is not in focus', flushSpy.count, 1 );
		assert.equal( 'parent finish not triggered because it is not set', parFinishSpy.count, 0 );
		assert.equal( 'render check triggered because no parent assertion', checkSpy.count, 1 );

		// Test parent assert attachment
		parAssert.ns = {};
		module.parAssert = parAssert;
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		submod.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish();
		assert.equal( 'submod close not triggered when already clsoed off', subCloseSpy.count, 2 );
		assert.equal( 'parent finish not triggered because it is not closed yet', parFinishSpy.count, 0 );
		assert.equal( 'render check not triggered while parent is set', checkSpy.count, 1 );

		// Test parent assert closed and submodules finished
		module.ns = {};
		parAssert.ns = { d: submod };
		submod.state = MUNIT.ASSERT_STATE_FINISHED;
		parAssert.state = MUNIT.ASSERT_STATE_CLOSED;
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish();
		assert.equal( 'parent finish triggered when all its submodules are finished', parFinishSpy.count, 1 );

		// Test parent assert closed and submodules not finished
		submod.state = MUNIT.ASSERT_STATE_CLOSED;
		module.state = MUNIT.ASSERT_STATE_CLOSED;
		module.finish();
		assert.equal( 'parent finish not triggered until all its submodules are finished', parFinishSpy.count, 1 );
	}

});
