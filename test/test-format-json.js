munit( 'format.json', function( assert ) {
	var format = MUNIT.render._formatHash.json,
		callback = assert.spy(),
		module1 = new MUNIT.Assert( 'a.b.c' ),
		module2 = new MUNIT.Assert( 'a.b.d' ),
		nodeVersion = process.version.replace( /\./g, '_' ),
		_ns = MUNIT.ns,
		match,

		fs = require( 'fs' ),
		writeSpy = assert.spy( fs, 'writeFile', {
			onCall: function( path, data, callback ) {
				callback();
			}
		});

	// Setup and run through
	MUNIT.extend({
		passed: 34,
		failed: 4,
		skipped: 2,
		start: Date.now() - 4532,
		end: Date.now() - 2413,
		ns: {
			core: module1,
			util: module2
		},
	});
	match = JSON.stringify({
		node_version: process.version,
		munit_version: MUNIT.version,
		passed: MUNIT.passed,
		failed: MUNIT.failed,
		skipped: MUNIT.skipped,
		start: MUNIT.start,
		end: MUNIT.end,
		ns: MUNIT.ns,
	});
	format.callback( '/a/results/dir/', callback );
	assert.equal( 'writeFile triggered', writeSpy.count, 1 );
	assert.deepEqual( 'writeFile args', writeSpy.args, [ '/a/results/dir/' + nodeVersion + '.json', match, callback ] );
	assert.equal( 'callback triggered', callback.count, 1 );

	// Reset
	MUNIT.ns = _ns;
});
