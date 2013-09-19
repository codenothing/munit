munit( 'format.junit', function( assert ) {
	var format = MUNIT.render._formatHash.junit,
		callback = assert.spy(),
		module1 = new MUNIT.Assert( 'a.b.c' ),
		module2 = new MUNIT.Assert( 'a.b.d' ),
		nodeVersion = process.version.replace( /\./g, '_' ),
		_tests = MUNIT.tests,

		fs = require( 'fs' ),
		writeSpy = assert.spy( fs, 'writeFile', {
			onCall: function( path, data, callback ) {
				callback();
			}
		});

	// Setup and run through
	MUNIT.tests = [ module1, module2 ];
	format.callback( '/a/results/dir/', callback );
	assert.equal( 'writeFile triggered for each module', writeSpy.count, 2 );
	assert.equal( 'writeFile first args path', writeSpy.history[ 0 ].args[ 0 ], '/a/results/dir/' + nodeVersion + '.a.b.c.xml' );
	assert.equal( 'writeFile first args xml', writeSpy.history[ 0 ].args[ 1 ], module1.junit() );
	assert.equal( 'writeFile second args path', writeSpy.history[ 1 ].args[ 0 ], '/a/results/dir/' + nodeVersion + '.a.b.d.xml' );
	assert.equal( 'writeFile second args xml', writeSpy.history[ 1 ].args[ 1 ], module2.junit() );
	assert.equal( 'callback triggered', callback.count, 1 );

	// Reset
	MUNIT.tests = _tests;
});
