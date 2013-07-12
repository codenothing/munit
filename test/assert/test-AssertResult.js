var AssertResult = MUNIT.AssertResult,
	AssertionError = MUNIT.AssertionError;

munit( 'AssertResult.core', function( assert ) {
	var result = new AssertResult( 'test', 'a.b.c', 25, new AssertionError( 'Some Bad Error' ), 'skip reason' );

	assert.equal( 'name', result.name, 'test' )
		.equal( 'nsPath', result.nsPath, 'a.b.c' )
		.equal( 'ns', result.ns, 'a.b.c.test' )
		.equal( 'time', result.time, 25 )
		.isError( 'error', result.error )
		.equal( 'skip', result.skip, 'skip reason' )
		.isFunction( 'junit', result.junit );
});
