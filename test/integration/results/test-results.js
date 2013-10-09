munit( 'Integration.results', 7, function( assert, queue ) {
	MUNIT( 'project.core', function( module ) {
		module.pass( 'main methods' );
	});

	MUNIT( 'project.util', function( module ) {
		module.fail( 'utility test' );
	});

	MUNIT.render({ results: __dirname + '/nested/results/dir/' }, function( e, m ) {
		var fs = require( 'fs' ),
			nodeVersion = process.version.replace( /\./g, '_' ),
			nestedDIR = __dirname + '/nested/results/dir/';

		assert.equal( '1 passed test', MUNIT.passed, 1 );
		assert.equal( '1 failed test', MUNIT.failed, 1 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );
		assert.isTrue( 'json results', fs.existsSync( nestedDIR + 'json/' + nodeVersion + '.json' ) );
		assert.isTrue( 'junit results project', fs.existsSync( nestedDIR + 'junit/' + nodeVersion + '.project.xml' ) );
		assert.isTrue( 'junit results project.core', fs.existsSync( nestedDIR + 'junit/' + nodeVersion + '.project.core.xml' ) );
		assert.isTrue( 'junit results project.util', fs.existsSync( nestedDIR + 'junit/' + nodeVersion + '.project.util.xml' ) );
	});
});
