var munit = global.munit,
	fs = require( 'graceful-fs' ),
	nodeVersion = process.version.replace( /\./g, '_' );

munit.render.addFormat( 'json', function( dir, callback ) {
	fs.writeFile(
		dir + nodeVersion + '.json',
		JSON.stringify({
			node_version: process.version,
			munit_version: munit.version,
			passed: munit.passed,
			failed: munit.failed,
			skipped: munit.skipped,
			start: munit.start,
			end: munit.end,
			ns: munit.ns,
		}),
		callback
	);
});
