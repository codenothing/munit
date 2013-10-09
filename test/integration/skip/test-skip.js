munit( 'Integration.skip', 5, function( assert ) {
	MUNIT( 'core', function( module ) {
		module.pass( 'first test' );
	});

	MUNIT( 'util', function( module ) {
		module.skip( "no util tests", "testing skipping of a test" );
	});

	MUNIT.render(function( e, m ) {
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'passed tests', MUNIT.passed, 1 );
		assert.equal( 'only 1 skipped test', MUNIT.skipped, 1 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
	});
});
