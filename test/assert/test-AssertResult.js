munit( 'AssertResult.core', function( assert ) {
	var result = new munit.AssertResult( 'test', 'a.b.c', 25, new munit.AssertionError( 'Some Bad Error' ) );

	assert.equal( 'name', result.name, 'test' )
		.equal( 'nsPath', result.nsPath, 'a.b.c' )
		.equal( 'ns', result.ns, 'a.b.c.test' )
		.equal( 'time', result.time, 25 )
		.isError( 'error', result.error )
		.isFunction( 'junit', result.junit );
});
