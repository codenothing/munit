var Spy = MUNIT.Spy,
	SpyCall = MUNIT.SpyCall;

// Checks method existance
munit( 'Spy.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		object = { me: munit.noop },
		spy = Spy( module, object, 'me' ),
		scope = {},
		call = new SpyCall( scope, [ 'string', 123, true ], spy );

	assert.isFunction( 'Spy', Spy )
		.isFunction( 'SpyCall', SpyCall )
		.isFunction( 'created spy', spy )
		.isTrue( 'isSpy', spy.isSpy )
		.equal( 'original', spy.original, munit.noop )
		.equal( '_module', spy._module, object )
		.equal( '_method', spy._method, 'me' )
		.isTrue( 'spy auto wraps', spy.wrapped )
		.equal( 'assert', spy.assert, module )
		.equal( 'count', spy.count, 0 )
		.equal( 'order', spy.order, -1 )
		.equal( 'overall', spy.overall, -1 )
		.isNull( 'spy scope initially null', spy.scope )
		.deepEqual( 'last args', spy.args, [] )
		.deepEqual( 'history', spy.history, [] )
		.isObject( 'options', spy.options )
		.isObject( 'data', spy.data )
		.isFunction( 'option handle', spy.option )
		.isFunction( 'restore', spy.restore )
		.isFunction( 'reset', spy.reset )
		.isFunction( 'onCall', spy.onCall )
		.isFunction( 'afterCall', spy.afterCall )
		.equal( 'spycall scope', call.scope, scope )
		.equal( 'spycall order', call.order, 0 )
		.equal( 'spycall overall', call.overall, 0 )
		.deepEqual( 'spycall args', call.args, [ 'string', 123, true ] )
		.isDate( 'spycall time', call.time );
});


munit( 'Spy', {

	// Creating spys from an assertion module
	'assert creation': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			mockOptions = { passthru: true },
			creationSpy = assert.spy( MUNIT, 'Spy', { passthru: true } ),
			spy;

		// Trigger creation
		assert.doesNotThrow( 'create no error', function(){
			spy = module.spy( mock, 'me', mockOptions );
		});
		assert.equal( 'Spy triggered', creationSpy.count, 1 );
		assert.deepEqual( 'Spy args', creationSpy.args, [ module, mock, 'me', mockOptions ] );
		assert.equal( 'Spy stored internally', module._spies[ 0 ], spy );

		// Spy method should throw when attempting to create on an inactive module
		module.state = MUNIT.ASSERT_STATE_TEARDOWN;
		assert.throws( 'Inactive module spy throws', /'a.b.c' is in the teardown processs/, function(){
			module.spy( mock, 'me', mockOptions );
		});
	},

	// Spy Creation
	creation: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			mockOptions = { passthru: true },
			spy;

		assert.throws( "Can't create spy without assert module", /Spies require an assertion module/, function(){
			Spy( mock, 'me', mockOptions );
		});

		// Restoration
		spy = Spy( module, mock, 'me', mockOptions );
		assert.isTrue( 'wrapped', spy.wrapped );
		assert.equal( 'mock overwritten', mock.me, spy );
		assert.equal( 'original match', spy.original, munit.noop );
	},

	// Calling spy
	trigger: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: function( callback ) { callback(); } },
			mockOptions = { passthru: true },
			scope = {},
			spy = Spy( module, mock, 'me', mockOptions ),
			callback = assert.spy(),
			onCallSpy = assert.spy(),
			afterCallSpy = assert.spy(),
			now = Date.now(),
			call, step = 0;

		// Check that passthru works
		Spy.overall = 5;
		spy.call( scope, callback );
		assert.equal( 'passthru option should caused trigger', callback.count, 1 );
		assert.equal( 'spy.history', spy.history.length, 1 );
		assert.equal( 'spy.scope', spy.scope, scope );
		assert.deepEqual( 'spy.args', spy.args, [ callback ] );
		assert.equal( 'spy.count', spy.count, 1 );
		assert.equal( 'spy.overall', spy.overall, 5 );
		assert.equal( 'Spy.overall incremented', Spy.overall, 6 );
		assert.equal( 'module._spyOrder incremented', module._spyOrder, 1 );

		// Check spycall history
		call = spy.history[ 0 ];
		assert.equal( 'scope matches first history', spy.scope, call.scope );
		assert.equal( 'args match first history', spy.args, call.args );
		assert.equal( 'call.order', call.order, 0 );
		assert.equal( 'call.overall', call.overall, 5 );
		assert.isTrue( 'spy call just happened', call.time >= now );

		// Check history and count after a few triggers
		mock = { me: munit.noop };
		spy = Spy( module, mock, 'me', mockOptions );
		module._spyOrder = 4;
		Spy.overall = 10;
		spy();
		spy();
		spy();
		spy();
		assert.equal( 'multi trigger count', spy.count, 4 );
		assert.equal( 'multi trigger history', spy.history.length, 4 );
		assert.equal( 'multi trigger order', spy.order, 7 );
		assert.equal( 'multi trigger overall', spy.overall, 13 );

		// Check callback steps, arguments, and scope
		step = 'onCall';
		mock = {
			me: function( a, b, c ) {
				assert.equal( 'step - original', step, 'original' );
				assert.equal( 'step - original - scope', this, scope );
				assert.deepEqual( 'step - original - args', [ a, b, c ], [ 1, 'test', true ] );
				step = 'afterCall';
			}
		};
		spy = Spy( module, mock, 'me', {
			passthru: true,
			onCall: function( a, b, c ) {
				assert.equal( 'step - onCall', step, 'onCall' );
				assert.equal( 'step - onCall - scope', this, scope );
				assert.deepEqual( 'step - onCall - args', [ a, b, c ], [ 1, 'test', true ] );
				step = 'original';
			},
			afterCall: function( a, b, c ) {
				assert.equal( 'step - afterCall', step, 'afterCall' );
				assert.equal( 'step - afterCall - scope', this, scope );
				assert.deepEqual( 'step - afterCall - args', [ a, b, c ], [ 1, 'test', true ] );
				step = 'done';
			}
		});
		spy.call( scope, 1, 'test', true );
		assert.equal( 'step - done', step, 'done');

		// Check creation of generic spy with no wrapper
		spy = Spy( module, {
			passthru: true,
			onCall: onCallSpy,
			afterCall: afterCallSpy
		});
		assert.isFalse( 'generic - wrapped', spy.wrapped );
		assert.empty( 'generic - original', spy.original );
		spy.call( scope );
		assert.equal( 'generic - onCall triggered', onCallSpy.count, 1 );
		assert.deepEqual( 'generic - onCall args (scope spy)', onCallSpy.args, [] );
		assert.equal( 'generic - afterCall triggered', afterCallSpy.count, 1 );
		assert.deepEqual( 'generic - afterCall args (scope spy)', afterCallSpy.args, [] );
	},

	// Options method
	options: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			mockOptions = { passthru: true },
			spy = Spy( module, mock, 'me', mockOptions ),
			optionSpy;

		// Initial state from injection
		assert.isTrue( 'getter passthru', spy.option( 'passthru' ) );
		assert.equal( 'getter other', spy.option( 'other' ), undefined );

		// Single Setter
		spy.option( 'passthru', false );
		assert.isFalse( 'single settter passthru', spy.option( 'passthru' ) );
		assert.equal( 'single settter other', spy.option( 'other' ), undefined );

		// Multi Object Setter
		spy.option({ passthru: true, other: false });
		assert.isTrue( 'multi settter passthru', spy.option( 'passthru' ) );
		assert.isFalse( 'multi settter other', spy.option( 'other' ) );

		// Test shortcuts go directly through option
		optionSpy = assert.spy( spy, 'option' );
		[ 'onCall', 'afterCall' ].forEach(function( name, index ) {
			spy[ name ]( name + '-value' );
			assert.equal( 'option shortcut ' + name + ' triggered option', optionSpy.count, index + 1 );
			assert.deepEqual( 'option shortcut ' + name + ' args', optionSpy.args, [ name, name + '-value' ] );
		});
	},

	// Testing restore method
	restore: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			spy, ret;

		spy = Spy( module, mock, 'me' );
		assert.isTrue( 'wrapped', spy.wrapped );

		ret = spy.restore();
		assert.equal( 'spy is returned', ret, spy );
		assert.isFalse( 'not wrapped after restore', spy.wrapped );
		assert.equal( 'mock restored', mock.me, munit.noop );
	},

	// Testing reset
	reset: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			spy = Spy( module, mock, 'me' ),
			scope = {},
			ret;

		spy.call( scope, 'arg' );
		assert.equal( 'pre-reset history', spy.history.length, 1 );
		assert.equal( 'pre-reset args', spy.args.length, 1 );
		assert.equal( 'pre-reset count', spy.count, 1 );
		assert.equal( 'pre-reset scope', spy.scope, scope );

		spy.reset();
		assert.equal( 'history empty', spy.history.length, 0 );
		assert.equal( 'args empty', spy.history.length, 0 );
		assert.equal( 'count reset', spy.count, 0 );
		assert.isNull( 'scope null', spy.scope );
	},

	// All combinations of return value
	returnValue: function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: function(){ return false; } },
			spy = module.spy( mock, 'me', { returnValue: 42 } );

		// Option direct
		assert.equal( 'option returnValue', spy(), 42 );

		// Overwritten with onCall
		spy.option( 'onCall', function(){
			return true;
		});
		assert.equal( 'onCall overwrite', spy(), true );

		// Original function can overwrite if passthru is true and return value doesn't exist
		delete spy.options.returnValue;
		spy.option( 'passthru', true );
		assert.equal( 'passthru overwrite', spy(), false );

		// Aftercall return value trumps all
		spy.option( 'afterCall', function(){
			return 'afterCall';
		});
		assert.equal( 'afterCall overwrite', spy(), 'afterCall' );
	},

	// Spy restoration in assertion modules
	'assert restore': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			mockOptions = { passthru: true },
			spy = module.spy( mock, 'me', mockOptions );

		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._teardown = munit.noop;

		assert.equal( 'start state', mock.me, spy );
		module.close();
		assert.equal( 'restore after close', mock.me, munit.noop );
	},

	// Ensure assert closes spies in reverse order to handle overwrites
	'assert reverse': function( assert ) {
		var module = MUNIT.Assert( 'a.b.c' ),
			mock = { me: munit.noop },
			copy = mock.me,
			step = 'step',
			spy1 = module.spy( mock, 'me' ),
			restore1 = assert.spy( spy1, 'restore', {
				passthru: true,
				onCall: function(){
					assert.equal( 'restore spy1', step, 'restore1' );
					assert.equal( 'restore spy1 is mock.me', mock.me, spy1 );
					step = 'finish';
				}
			}),
			spy2 = module.spy( mock, 'me' ),
			restore2 = assert.spy( spy2, 'restore', {
				passthru: true,
				onCall: function(){
					assert.equal( 'restore spy2', step, 'restore2' );
					assert.equal( 'restore spy2 is mock.me', mock.me, spy2 );
					step = 'restore1';
				}
			});

		assert.equal( 'starting mock.me is spy2', mock.me, spy2 );
		module.state = MUNIT.ASSERT_STATE_ACTIVE;
		module._teardown = munit.noop;
		step = 'restore2';
		module.close();
		assert.equal( 'steps completed', step, 'finish' );
		assert.equal( 'mock.me fully restored', mock.me, copy );
	}

});
