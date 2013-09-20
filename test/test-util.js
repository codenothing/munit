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
		var exitSpy = assert.spy( process, 'exit' ),
			redSpy = assert.spy( MUNIT.color, 'red' ),
			logSpy = assert.spy( MUNIT, 'log' ),
			error = new Error( 'Test Error' );

		MUNIT.exit( 101, error, 'Extra Message' );
		assert.equal( 'color.red triggered for error & extra message', redSpy.count, 1 );
		assert.deepEqual( 'color.red args for error & extra message', redSpy.args, [ 'Extra Message' ] );
		assert.equal( 'munit.log triggered for error & extra message', logSpy.count, 1 );
		assert.deepEqual( 'munit.log args for error & extra message', logSpy.args, [ error.stack ] );
		assert.equal( 'process.exit for error & extra message', exitSpy.count, 1 );
		assert.deepEqual( 'process.exit args for error & extra message', exitSpy.args, [ 101 ] );

		MUNIT.exit( 1, 'Only Message' );
		assert.equal( 'color.red triggered for only message', redSpy.count, 2 );
		assert.deepEqual( 'color.red args for only message', redSpy.args, [ 'Only Message' ] );
		assert.equal( 'munit.log not triggered for only message', logSpy.count, 1 );
		assert.equal( 'process.exit for only message', exitSpy.count, 2 );
		assert.deepEqual( 'process.exit args for only message', exitSpy.args, [ 1 ] );

		MUNIT.exit( 2, error );
		assert.equal( 'munit.log triggered for only error', logSpy.count, 2 );
		assert.deepEqual( 'munit.log args for only error', logSpy.args, [ error.stack ] );
		assert.equal( 'color.red not triggered for only error', redSpy.count, 2 );
		assert.equal( 'process.exit for only error', exitSpy.count, 3 );
		assert.deepEqual( 'process.exit args for only error', exitSpy.args, [ 2 ] );

		MUNIT.exit( 0 );
		assert.equal( 'color.red not triggered for only exit code', redSpy.count, 2 );
		assert.equal( 'munit.log not triggered for only exit code', logSpy.count, 2 );
		assert.equal( 'process.exit for only exit code', exitSpy.count, 4 );
		assert.deepEqual( 'process.exit args for only exit code', exitSpy.args, [ 0 ] );

		MUNIT.exit( 0, {} );
		assert.equal( 'color.red not triggered for exit code and invalid error object', redSpy.count, 2 );
		assert.equal( 'munit.log not triggered for exit code and invalid error object (only error objects allowed)', logSpy.count, 2 );
		assert.equal( 'process.exit for only exit code and invalid error object', exitSpy.count, 5 );
		assert.deepEqual( 'process.exit args for only exit code and invalid error object', exitSpy.args, [ 0 ] );
	},

	require: function( assert ) {
		var result = MUNIT.require( __dirname + '/require-test-file.js' );

		assert.isObject( 'Require did return an object', result );
		assert.equal( 'Global munit passed should match current munit', result.munit, MUNIT );
		assert.equal( 'Global munit should be overwritten with previous munit', result.current(), munit );
		assert.notEqual( 'Munits should not match', munit, MUNIT );
	}

});
