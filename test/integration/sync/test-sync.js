munit.queue( 'Integration.sync', { priority: munit.PRIORITY_HIGHER, expect: 5 }, function( queue, assert ) {
	MUNIT( 'core.util', function( module ) {
		module.pass( 'first test' );
	});

	MUNIT( 'core.other', function( module ) {
		module.pass( 'other test' );
	});

	MUNIT.render(function( e, m ) {
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'only 2 tests applied', MUNIT.passed, 2 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );
	});
});
