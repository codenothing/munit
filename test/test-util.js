munit( 'util', {

	'type checks': function( assert ) {
		assert.isTrue( 'isBoolean - True Boolean', MUNIT.isBoolean( true ) )
			.isTrue( 'isBoolean - Flase Boolean', MUNIT.isBoolean( false ) )
			.isFalse( 'isBoolean - Int non-Boolean', MUNIT.isBoolean( 1 ) )
			.isFalse( 'isBoolean - Int false non-boolean', MUNIT.isBoolean( 0 ) )

			.isTrue( 'isNumber - Number', MUNIT.isNumber( 10 ) )
			.isTrue( 'isNumber - Float Number', MUNIT.isNumber( 10.001 ) )
			.isTrue( 'isNumber - <1 Float Number', MUNIT.isNumber( 0.001 ) )
			.isFalse( 'isNumber - Boolean Number', MUNIT.isNumber( true ) )

			.isTrue( 'isString - Basic String', MUNIT.isString( 'test' ) )
			.isFalse( 'isString - Null String', MUNIT.isString( null ) )

			.isTrue( 'isFunction - Function Check', MUNIT.isFunction( MUNIT.noop ) )
			.isFalse( 'isFunction - Function Instance', MUNIT.isFunction( new MUNIT.noop() ) )

			.isTrue( 'isArray - Basic Array', MUNIT.isArray( [1,2,3] ) )
			.isFalse( 'isArray - Array Like', MUNIT.isArray( {0:1,1:2,2:3,length:3} ) )

			.isTrue( 'isDate - Basic Date', MUNIT.isDate( new Date() ) )
			.isFalse( 'isDate - Plain Object', MUNIT.isDate( {} ) )

			.isTrue( 'isRegExp - Basic RegExp', MUNIT.isRegExp( /abc/i ) )
			.isFalse( 'isRegExp - Plain Object', MUNIT.isRegExp( {} ) )

			.isTrue( 'isObject - Basic Object', MUNIT.isObject( {a:'b',b:true} ) )
			.isFalse( 'isObject - Array Object', MUNIT.isObject( [1,2,3] ) )
			.isFalse( 'isObject - Null Object', MUNIT.isObject( null ) )

			.isTrue( 'isError - Error', MUNIT.isError( new Error( 'blah blah blah' ) ) )
			.isTrue( 'isError - AssertionError', MUNIT.isError( new MUNIT.AssertionError( 'blah blah blah' ) ) )
			.isTrue( 'isError - Class Match', MUNIT.isError( new MUNIT.AssertionError( 'blah blah blah' ), MUNIT.AssertionError ) )
			.isFalse( 'isError - Class Mismatch', MUNIT.isError( new Error( 'blah blah blah' ), MUNIT.AssertionError ) )
			.isFalse( 'isError - MUNIT.noop', MUNIT.isError( new MUNIT.noop() ) );
	},

	triggerLast: function( assert ) {
		var spy = assert.spy(),
			handle = null;

		// Success
		assert.doesNotThrow( 'Successful Trigger', function(){
			MUNIT.triggerLast( 1, true, 'string' )( null, spy );
		});
		assert.equal( 'last argument triggered', spy.count, 1 );
		assert.deepEqual( 'last argument args', spy.args, [ 1, true, 'string' ] );

		// Error
		assert.throws( "Throw when last argument isn't a function", "Last argument is not function (munit.triggerLast)", function(){
			MUNIT.triggerLast( 1, true, 'string' )( null, spy, null );
		});
	},

	_relativeTime: function( assert ) {
		[

			{
				name: 'milliseconds direct',
				time: 400,
				match: '400ms'
			},

			{
				name: 'milliseconds threshold',
				time: 1000,
				match: '1000ms'
			},

			{
				name: 'seconds min threshold',
				time: 1001,
				match: '1.001s'
			},

			{
				name: 'seconds sub',
				time: 15730,
				match: '15.73s'
			},

			{
				name: 'seconds max threshold',
				time: 60000,
				match: '60s'
			},

			{
				name: 'minutes min threshold',
				time: 60001,
				match: '1mins, 0.001s'
			},

			{
				name: 'minutes sub',
				time: 1043890,
				match: '17mins, 23.89s'
			}

		].forEach(function( object ) {
			assert.equal( object.name, MUNIT._relativeTime( object.time ), object.match );
		});
	},

	_xmlEncode: function( assert ) {
		[

			{
				name: 'basic conversion',
				input: "<a href='http://www.google.com'>Test</a>",
				match: "&lt;a href=&#039;http://www.google.com&#039;&gt;Test&lt;/a&gt;"
			},

			{
				name: 'all',
				input: "Test's for the \"Foo\" & \"Bar\" <company>",
				match: "Test&#039;s for the &quot;Foo&quot; &amp; &quot;Bar&quot; &lt;company&gt;"
			},

		].forEach(function( object ) {
			assert.equal( object.name, MUNIT._xmlEncode( object.input ), object.match );
		});
	},

	exit: function( assert ) {
		var exitSpy = assert.spy( MUNIT, '_exit' ),
			redSpy = assert.spy( MUNIT.color, 'red' ),
			logSpy = assert.spy( MUNIT, 'log' ),
			callbackSpy = assert.spy( MUNIT.render, 'callback' ),
			error = new Error( 'Test Error' ),
			_state = MUNIT.render.state,
			e;

		// Errors
		assert.throws( 'exit throws when no code is provided', "Numeric code parameter required for munit.exit", function(){
			MUNIT.exit();
		});
		assert.throws( 'exit throws when code is not numeric', "Numeric code parameter required for munit.exit", function(){
			MUNIT.exit( "123" );
		});


		MUNIT.render.state = MUNIT.RENDER_STATE_FINISHED;
		MUNIT.render.callback = undefined;
		MUNIT.exit( 101, error, 'Extra Message' );
		assert.equal( 'error & extra message - color.red triggered for', redSpy.count, 1 );
		assert.deepEqual( 'error & extra message - color.red args', redSpy.args, [ 'Extra Message' ] );
		assert.equal( 'error & extra message - munit.log triggered', logSpy.count, 1 );
		assert.deepEqual( 'error & extra message - munit.log args', logSpy.args, [ error.stack ] );
		assert.equal( 'error & extra message - exit', exitSpy.count, 1 );
		assert.deepEqual( 'error & extra message - exit args', exitSpy.args, [ 101 ] );

		MUNIT.render.state = MUNIT.RENDER_STATE_COMPLETE;
		MUNIT.render.callback = callbackSpy;
		MUNIT.exit( 1, 'Only Message' );
		assert.equal( 'message only - color.red triggered', redSpy.count, 2 );
		assert.deepEqual( 'message only - color.red args', redSpy.args, [ 'Only Message' ] );
		assert.equal( 'message only - munit.log not triggered when state is complete', logSpy.count, 1 );
		assert.equal( 'message only - render.callback triggered', callbackSpy.count, 1 );
		e = callbackSpy.args[ 0 ];
		assert.isError( 'message only - render.callback args error', e );
		assert.equal( 'message only - render.callback error code', e.code, 1 );
		assert.equal( 'message only - render.callback error message', e.message, 'Only Message' );
		assert.isUndefined( 'message only - render.callback removed after exit', MUNIT.render.callback );
		assert.equal( 'message only - exit not triggered when callback is applied', exitSpy.count, 1 );

		MUNIT.render.state = MUNIT.RENDER_STATE_FINISHED;
		MUNIT.render.callback = callbackSpy;
		MUNIT.exit( 2, error );
		assert.equal( 'only error - munit.log triggered', logSpy.count, 2 );
		assert.deepEqual( 'only error - munit.log args', logSpy.args, [ error.stack ] );
		assert.equal( 'only error - color.red not triggered with no message', redSpy.count, 2 );
		assert.equal( 'only error - callback triggered', callbackSpy.count, 2 );
		assert.deepEqual( 'only error - callback args', callbackSpy.args, [ error, MUNIT ] );
		assert.equal( 'only error - exit not triggered when callback applied', exitSpy.count, 1 );

		MUNIT.exit( 0 );
		assert.equal( 'only exit code - color.red not triggered', redSpy.count, 2 );
		assert.equal( 'only exit code - munit.log triggered', logSpy.count, 3 );
		assert.equal( 'only exit code - callback not triggered when not applied', callbackSpy.count, 2 );
		assert.equal( 'only exit code - exit', exitSpy.count, 2 );
		assert.deepEqual( 'only exit code - exit args', exitSpy.args, [ 0 ] );

		MUNIT.exit( 0, {} );
		assert.equal( 'exit code, invalid error - color.red not triggered', redSpy.count, 2 );
		assert.equal( 'exit code, invalid error -  munit.log triggered', logSpy.count, 4 );
		assert.equal( 'exit code, invalid error -  exit triggered', exitSpy.count, 3 );
		assert.deepEqual( 'exit code, invalid error -  exit args', exitSpy.args, [ 0 ] );

		// Restore
		MUNIT.render.state = _state;
	},

	_exit: function( assert ) {
		var spy = assert.spy( process, 'exit' );

		MUNIT._exit( 101 );
		assert.equal( 'process.exit triggered', spy.count, 1 );
		assert.deepEqual( 'process.exit args', spy.args, [ 101 ] );
	},

	require: function( assert ) {
		var result = MUNIT.require( __dirname + '/require-test-file.js' );

		assert.isObject( 'Require did return an object', result );
		assert.equal( 'Global munit passed should match current munit', result.munit, MUNIT );
		assert.equal( 'Global munit should be overwritten with previous munit', result.current(), munit );
		assert.notEqual( 'Munits should not match', munit, MUNIT );
	}

});
