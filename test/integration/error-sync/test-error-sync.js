munit.queue( 'Integration.error-sync', 6, function( queue, assert ) {
	MUNIT( 'core.util', function( module ) {
		module.pass( 'first test' );
	});

	MUNIT( 'core.other', function( module ) {
		module.fail( 'failed test' );
	});

	MUNIT.render(function( e, m ) {
		assert.isError( 'no error', e );
		assert.equal( 'error message', e.message, "Test failed with 1 errors" );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'only 2 tests applied', MUNIT.passed, 1 );
		assert.equal( 'no failed tests', MUNIT.failed, 1 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );
	});
});
