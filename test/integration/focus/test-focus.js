munit.queue( 'Integration.focus', 5, function( queue, assert ) {
	MUNIT( 'bravo', function( module ) {
		module.pass( 'first test' );
	});

	MUNIT( 'core.util', function( module ) {
		module.pass( 'first test' );
	});

	MUNIT( 'core.other.one', function( module ) {
		module.pass( 'other one test' );
	});

	MUNIT( 'core.other.two', function( module ) {
		module.pass( 'other two test' );
	});

	MUNIT.render({ focus: [ 'core.other', 'bravo' ] }, function( e, m ) {
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'only 3 tests applied for defined focus paths', MUNIT.passed, 3 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );
	});
});
