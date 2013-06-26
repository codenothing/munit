munit( 'assert.state', { priority: munit.PRIORITY_HIGHER } );

// State error testing
munit( 'assert.state._stateError', function( assert ) {
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
});


// State error testing
munit( 'assert.state.requireState', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	module.state = MUNIT.ASSERT_STATE_CLOSED;
	assert.doesNotThrow( 'State Matches', function(){
		module.requireState( MUNIT.ASSERT_STATE_CLOSED );
	});

	module.state = MUNIT.ASSERT_STATE_FINISHED;
	assert.throws( "State Doesn't Match", /'a.b.c' is finished/, function(){
		module.requireState( MUNIT.ASSERT_STATE_CLOSED );
	});
});


// State error testing
munit( 'assert.state.requireMaxState', function( assert ) {
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
});


// State error testing
munit( 'assert.state.requireMinState', function( assert ) {
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
});


// Setup path testing
munit( 'assert.state._setup', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

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
		module._setup(function(){
			assert.pass( '_setup callback triggered' );
		});
	});

	// Module jumps to active state on non-optional setup
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_ACTIVE );

	// Ensure callback got triggered properly
	if ( ! assert.tests[ '_setup callback triggered' ] ) {
		assert.fail( '_setup callback triggered' );
	}
});


// Setup with option path testing
munit( 'assert.state._setup option', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// Setup module for callback flow
	module.state = MUNIT.ASSERT_STATE_DEFAULT;
	module.options.setup = function( module, callback ) {
		assert.equal( 'setup state', module.state, MUNIT.ASSERT_STATE_SETUP );
		callback();
	};

	// Trigger setup
	assert.doesNotThrow( "_setup trigger", function(){
		module._setup(function(){
			assert.pass( '_setup callback triggered' );
		});
	});

	// Module is changed to active state when callback is triggered
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_ACTIVE );

	// Ensure option setup gets triggered
	if ( ! assert.tests[ 'setup state' ] ) {
		assert.fail( 'setup state' );
	}

	// Ensure callback got triggered properly
	if ( ! assert.tests[ '_setup callback triggered' ] ) {
		assert.fail( '_setup callback triggered' );
	}
});


// Teardown path testing
munit( 'assert.state._teardown', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

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
		module._teardown(function(){
			assert.pass( '_teardown callback triggered' );
		});
	});

	// Module jumps to closed state on non-optional teardown
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_CLOSED );

	// Ensure callback got triggered properly
	if ( ! assert.tests[ '_teardown callback triggered' ] ) {
		assert.fail( '_teardown callback triggered' );
	}
});


// Teardown with option path testing
munit( 'assert.state._teardown option', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// Setup module for callback flow
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module.options.teardown = function( module, callback ) {
		assert.equal( 'teardown state', module.state, MUNIT.ASSERT_STATE_TEARDOWN );
		callback();
	};

	// Trigger teardown
	assert.doesNotThrow( "_teardown trigger", function(){
		module._teardown(function(){
			assert.pass( '_teardown callback triggered' );
		});
	});

	// Module is changed to closed state when callback is triggered
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_CLOSED );

	// Ensure option setup gets triggered
	if ( ! assert.tests[ 'teardown state' ] ) {
		assert.fail( 'teardown state' );
	}

	// Ensure callback got triggered properly
	if ( ! assert.tests[ '_teardown callback triggered' ] ) {
		assert.fail( '_teardown callback triggered' );
	}
});


// Sync trigger testing
munit( 'assert.state.trigger sync', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// Track method invoking
	module.callback = function( asrt ) {
		assert.equal( 'Single Argument', arguments.length, 1 );
		assert.equal( 'First Argument Assert', asrt, module );
		assert.ok( 'Start Time Set', asrt.start > 0 );
		assert.equal( 'End time should match start', asrt.start, asrt.end );
	};
	module.close = function(){
		assert.pass( 'Sync Trigger' );
	};
	module.trigger();
	assert.isFalse( 'Non Async', module.isAsync );

	// Close should be triggered (sync module)
	if ( ! assert.tests[ 'Sync Trigger' ] ) {
		assert.fail( 'Sync Trigger' );
	}
});


// Async trigger tests with expect
munit( 'assert.state.trigger async expect', 2, function( assert ) {
	var module = MUNIT.Assert( 'a.b.c', null, { expect: 1, timeout: 20 } ), afterTrigger = false;

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
});


// Async trigger test with isAsync
munit( 'assert.state.trigger on isAsync true', 2, function( assert ) {
	var module = MUNIT.Assert( 'a.b.c', null, { isAsync: true, timeout: 20 } ), afterTrigger = false;

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
});


// Async trigger test with an error
munit( 'assert.state.trigger error', function( assert ) {
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
});


// Trigger with auto close
munit( 'assert.state.trigger auto close', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		_options = MUNIT._options;

	// Module auto close when there is no callback
	module.callback = null;
	module._close = function(){
		assert.pass( 'No Callback Close' );
	};
	module.trigger();
	assert.equal( 'No Callback Close State', module.state, MUNIT.ASSERT_STATE_CLOSED );

	// Ensure the close method gets triggered correctly
	if ( ! assert.tests[ 'No Callback Close' ] ) {
		assert.fail( 'No Callback Close' );
	}

	// Modules should also auto close when it's not part of the focus
	MUNIT._options = { focus: [ 'e.f' ] };
	module = MUNIT.Assert( 'a.b.c' );
	module.callback = function(){
		assert.fail( 'Callback shouldnt get called on non-focus path' );
	};
	module._close = function(){
		assert.pass( 'Focus Auto Close' );
	};
	module.trigger();
	assert.equal( 'Focus Auto Close State', module.state, MUNIT.ASSERT_STATE_CLOSED );

	// Ensure the close method gets triggered correctly
	if ( ! assert.tests[ 'Focus Auto Close' ] ) {
		assert.fail( 'Focus Auto Close' );
	}

	// Reset previous options
	MUNIT._options = _options;
});


// Close tests
munit( 'assert.state.close', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	module.state = MUNIT.ASSERT_STATE_TEARDOWN;
	assert.throws( 'Throws error when not in active state', /'a.b.c' is in the teardown processs/, function(){
		module.close();
	});

	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._teardown = function( callback ) {
		assert.pass( 'close to teardown' );
		callback();
	};
	module._close = function( startFunc, forced ) {
		assert.pass( 'teardown to _close' );
		assert.equal( 'passed startFunc', startFunc, munit.noop );
		assert.equal( 'passed forced', forced, true );
	};
	assert.doesNotThrow( 'close call', function(){
		module.close( munit.noop, true );
	});

	// Check to make sure teardown path got triggered
	if ( ! assert.tests[ 'close to teardown' ] ) {
		assert.fail( 'close to teardown' );
	}

	// Check to make sure _close path got triggered
	if ( ! assert.tests[ 'teardown to _close' ] ) {
		assert.fail( 'teardown to _close' );
	}
});


// Close tests
munit( 'assert.state.close to finish', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		_add = MUNIT.queue.add,
		object = { port: 1234 };

	// Setup module for full close path test
	module.queue = object;
	module._timeid = setTimeout( munit.noop, 1000 );
	module.end = 0;
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module.options.autoQueue = true;

	// Spy on internal function calls
	MUNIT.queue.add = function( queue ) {
		assert.pass( 'Queue add triggered' );
		assert.equal( 'queue passed', queue, object );
	};
	module.finish = function( startFunc, forced ) {
		assert.pass( 'finish triggered' );
		assert.equal( 'passed startFunc', startFunc, munit.noop );
		assert.equal( 'passed forced', forced, false );
	};

	// Module should be in correct state, but test just in case
	assert.doesNotThrow( 'close call', function(){
		module.close( munit.noop, false );
	});

	// Ensure queue was readded
	if ( ! assert.tests[ 'Queue add triggered' ] ) {
		assert.fail( 'Queue add triggered' );
	}

	// Ensure finish path was triggered
	if ( ! assert.tests[ 'finish triggered' ] ) {
		assert.fail( 'finish triggered' );
	}

	// After trigger tests
	assert.equal( 'queue null', module.queue, null );
	assert.equal( 'timeid cleared', module._timeid, undefined );
	assert.ok( 'end time set', module.end > 0 );
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_CLOSED );

	// Reassign the queue add method
	MUNIT.queue.add = _add;
});


// Closing module not on focus path testing
munit( 'assert.state._close on non-focus', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		_options = MUNIT._options;

	// Base test to ensure internal _fail call gets triggered properly
	module.options.expect = 2;
	module.count = 0;
	module.finish = munit.noop;
	module._fail = function(){
		assert.pass( 'initial base _fail passed' );
	};
	module._close();

	// Fail out if pass through _fail isn't called here
	if ( ! assert.tests[ 'initial base _fail passed' ] ) {
		assert.fail( 'initial base _fail not called' );
	}

	// Setup focus test
	MUNIT._options = { focus: [ 'e.f' ] };
	module._fail = function(){
		assert.pass( "_fail shouldn't be called on non-focus" );
	};
	module._close();

	// Pass if _fail not triggered
	if ( ! assert.tests[ "_fail shouldn't be called on non-focus" ] ) {
		assert.pass( 'internal _fail not called on focus' );
	}

	// Reset previous options
	MUNIT._options = _options;
});


// Finish tests
munit( 'assert.state.finish', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// Check that non closed states throws an error
	module.state = MUNIT.ASSERT_STATE_TEARDOWN;
	assert.throws( 'Throws error when not in closed state', /'a.b.c' is in the teardown processs/, function(){
		module.finish();
	});

	// Setup module to allow for finish
	module.state = MUNIT.ASSERT_STATE_CLOSED;
	module._flush = function(){
		assert.pass( '_flush trigger' );
	};

	// Module should be in correct state, but test just in case
	assert.doesNotThrow( 'finish call', function(){
		module.finish( munit.noop, true );
	});

	// State should swap to finished
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_FINISHED );

	// Ensure flush was triggered
	if ( ! assert.tests[ '_flush trigger' ] ) {
		assert.fail( '_flush trigger' );
	}
});


// Finish tests
munit( 'assert.state.finish force', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		_check = MUNIT.render.check;

	// Setup module to allow for finish
	module.state = MUNIT.ASSERT_STATE_CLOSED;
	module._flush = function(){
		assert.pass( '_flush trigger' );
	};
	MUNIT.render.check = function(){
		assert.pass( 'render check trigger' );
	};

	// Module should be in correct state, but test just in case
	assert.doesNotThrow( 'finish call', function(){
		module.finish();
	});

	// State should swap to finished
	assert.equal( 'state', module.state, MUNIT.ASSERT_STATE_FINISHED );

	// Ensure flush was triggered
	if ( ! assert.tests[ '_flush trigger' ] ) {
		assert.fail( '_flush trigger' );
	}

	// Ensure render check was triggered
	if ( ! assert.tests[ 'render check trigger' ] ) {
		assert.fail( 'render check trigger' );
	}

	// Reapply check
	MUNIT.render.check = _check;
});


// Finish tests
munit( 'assert.state.finish focus', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		_options = MUNIT._options,
		_check = MUNIT.render.check;

	// Setup base test case to ensure _flush gets called correctly
	module.state = MUNIT.ASSERT_STATE_CLOSED;
	module._flush = function(){
		assert.pass( 'base _flush called' );
	};
	MUNIT.render.check = function(){
		assert.pass( 'base render.check passed' );
	};
	module.finish();

	// Internal _flush should not have been called
	if ( ! assert.tests[ 'base _flush called' ] ) {
		assert.fail( 'base _flush not called' );
	}

	// Render.check should have been called
	if ( ! assert.tests[ 'base render.check passed' ] ) {
		assert.fail( 'base render.check not called' );
	}

	// Setup test case to not trigger _flush internally
	MUNIT._options = { focus: [ 'e.f' ] };
	module.state = MUNIT.ASSERT_STATE_CLOSED;
	module._flush = function(){
		assert.fail( "_flush not blocked" );
	};
	MUNIT.render.check = function(){
		assert.pass( 'focus render.check passed' );
	};
	module.finish();

	// Internal _flush should have been called
	if ( ! assert.tests[ '_flush not blocked' ] ) {
		assert.pass( '_flush blocked' );
	}

	// Render.check should have been called
	if ( ! assert.tests[ 'focus render.check passed' ] ) {
		assert.fail( 'focus render.check not called' );
	}

	// Reapply check and options
	MUNIT.render.check = _check;
	MUNIT._options = _options;
});
