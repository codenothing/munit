munit.queue( 'Integration.dir-structure', 11, function( queue, assert ) {
	MUNIT.render( __dirname + '/project/', { file_match: /^custom\-(.*?)\.js$/ }, function( e, m ) {
		// Basic Tests
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'only 4 tests applied', MUNIT.passed, 4 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );

		// Module structure
		assert.empty( 'ns.fail should not be here', MUNIT.ns.fail );
		assert.exists( 'ns.core', MUNIT.ns.core );
		assert.exists( 'ns.util', MUNIT.ns.util );
		assert.exists( 'ns.nested', MUNIT.ns.nested );
		assert.exists( 'ns.nested.route', MUNIT.ns.nested.ns.route );
		assert.exists( 'ns.nested.url', MUNIT.ns.nested.ns.url );
	});
});
