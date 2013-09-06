var munit = global.munit,
	fs = require( 'fs' ),
	async = require( 'async' ),
	nodeVersion = process.version.replace( /\./g, '_' );

munit.render.addFormat( 'junit', function( dir, callback ) {
	async.map(
		munit.tests,
		function( assert, callback ) {
			fs.writeFile( dir + nodeVersion + '.' + assert.nsPath + '.xml', assert.junit(), callback );
		},
		callback
	);
});
