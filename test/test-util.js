munit( "util.type checks", function( assert ) {
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
});
