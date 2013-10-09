munit( 'Integration.async', { priority: munit.PRIORITY_HIGHER, expect: 5 }, function( assert ) {
	MUNIT.async( 'core.util', 1, function( module ) {
		setTimeout(function(){
			module.pass( 'first test' );
		}, 300 );
	});

	MUNIT.async( 'core.other', 1, function( module ) {
		setTimeout(function(){
			module.pass( 'other test' );
		}, 300 );
	});

	MUNIT.render(function( e, m ) {
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'only 2 tests applied', MUNIT.passed, 2 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );
	});
});
