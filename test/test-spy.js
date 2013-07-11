var Spy = MUNIT.Spy,
	SpyCall = MUNIT.SpyCall;

// Checks method existance
munit( 'Spy.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		object = { me: munit.noop },
		spy = Spy( module, object, 'me' ),
		call = new SpyCall( [ 'string', 123, true ] );

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
		.deepEqual( 'last args', spy.args, [] )
		.deepEqual( 'history', spy.history, [] )
		.isObject( 'options', spy.options )
		.isFunction( 'option handle', spy.option )
		.isFunction( 'restore', spy.restore )
		.deepEqual( 'spycall args', call.args, [ 'string', 123, true ] )
		.isDate( 'spycall time', call.time );
});


// Creating spys from an assertion module
munit( 'Spy.assert creation', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		mock = { me: munit.noop },
		mockOptions = { passthru: true },
		spy;

	// Pass thru
	MUNIT.Spy = function( mod, object, method, options ) {
		assert.pass( 'Spy Triggered' )
			.equal( 'trigger - assert', mod, module )
			.equal( 'trigger - object', object, mock )
			.equal( 'trigger - method', method, 'me' )
			.equal( 'trigger - options', options, mockOptions );
	};
	assert.doesNotThrow( 'create no error', function(){
		spy = module.spy( mock, 'me', mockOptions );
	});
	assert.equal( 'Spy stored internally', module._spies[ 0 ], spy );

	// Spy method should throw when attempting to create on an inactive module
	module.state = MUNIT.ASSERT_STATE_TEARDOWN;
	assert.throws( 'Inactive module spy throws', /'a.b.c' is in the teardown processs/, function(){
		module.spy( mock, 'me', mockOptions );
	});

	// Return spy method to it's original state
	MUNIT.Spy = Spy;
});


// Spy Creation
munit( 'Spy.creation', function( assert ) {
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
	spy.restore();
	assert.isFalse( 'wrapped after restore', spy.wrapped );
	assert.equal( 'mock restored', mock.me, munit.noop );
});


// Options method
munit( 'Spy.options', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		mock = { me: munit.noop },
		mockOptions = { passthru: true },
		spy = Spy( module, mock, 'me', mockOptions );

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
});


// Calling spy
munit( 'Spy.trigger', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		mock = { me: function( callback ) { callback(); } },
		mockOptions = { passthru: true },
		spy = Spy( module, mock, 'me', mockOptions ),
		now = Date.now(),
		call, step = 0;

	// Check that passthru works
	spy(function(){
		assert.pass( 'passthru' );
	});
	if ( ! assert.tests.passthru ) {
		assert.fail( 'passthru' );
	}

	// Check spycall history
	call = spy.history[ 0 ];
	assert.equal( 'history', spy.history.length, 1 );
	assert.equal( 'args match first history', spy.args, call.args );
	assert.equal( 'count', spy.count, 1 );
	assert.isTrue( 'spy call just happened', call.time >= now );

	// Check history and count after a few triggers
	mock = { me: munit.noop };
	spy = Spy( module, mock, 'me', mockOptions ),
	spy();
	spy();
	spy();
	spy();
	assert.equal( 'multi trigger count', spy.count, 4 );
	assert.equal( 'multi trigger history', spy.history.length, 4 );

	// Check callback steps, arguments, and scope
	step = 'oncall';
	mock = {
		me: function( a, b, c ) {
			assert.equal( 'step - original', step, 'original' );
			assert.equal( 'step - original - scope', this, mock );
			assert.deepEqual( 'step - original - args', [ a, b, c ], [ 1, 'test', true ] );
			step = 'aftercall';
		}
	};
	spy = Spy( module, mock, 'me', {
		passthru: true,
		oncall: function( a, b, c ) {
			assert.equal( 'step - oncall', step, 'oncall' );
			assert.equal( 'step - oncall - scope', this, mock );
			assert.deepEqual( 'step - oncall - args', [ a, b, c ], [ 1, 'test', true ] );
			step = 'original';
		},
		aftercall: function( a, b, c ) {
			assert.equal( 'step - aftercall', step, 'aftercall' );
			assert.equal( 'step - aftercall - scope', this, mock );
			assert.deepEqual( 'step - aftercall - args', [ a, b, c ], [ 1, 'test', true ] );
			step = 'done';
		}
	});
	spy( 1, 'test', true );
	assert.equal( 'step - done', step, 'done');

	// Check creation of generic spy with no wrapper
	spy = Spy( module, {
		passthru: true,
		oncall: function(){
			assert.equal( 'generic - oncall spy scope', this, spy );
		},
		aftercall: function(){
			assert.equal( 'generic - aftercall spy scope', this, spy );
		}
	});
	assert.isFalse( 'generic - wrapped', spy.wrapped );
	assert.empty( 'generic - original', spy.original );
	spy();

	// No step tracker, make sure oncall get triggered
	if ( ! assert.tests[ 'generic - oncall spy scope' ] ) {
		assert.fail( 'generic - oncall spy scope' );
	}

	// No step tracker, make sure aftercall gets triggered
	if ( ! assert.tests[ 'generic - aftercall spy scope' ] ) {
		assert.fail( 'generic - aftercall spy scope' );
	}
});


// Spy restoration in assertion modules
munit( 'Spy.assert restore', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		mock = { me: munit.noop },
		mockOptions = { passthru: true },
		spy = module.spy( mock, 'me', mockOptions );

	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._teardown = munit.noop;

	assert.equal( 'start state', mock.me, spy );
	module.close();
	assert.equal( 'restore after close', mock.me, munit.noop );
});
