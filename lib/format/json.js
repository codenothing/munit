var munit = global.munit,
	fs = require( 'fs' ),
	nodeVersion = process.version.replace( /\./g, '_' );

munit.render.addFormat( 'json', function( dir, callback ) {
	fs.writeFile(
		dir + nodeVersion + '.json',
		JSON.stringify({
			node_version: process.version,
			munit_version: munit.version,
			ns: munit.ns,
		}),
		callback
	);
});
