var fs = require( 'fs' ),
	render = MUNIT.render;

// Core render functions and properties
munit( 'render.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	assert.isFunction( 'render', render )
		.isFunction( 'check', render.check )
		.isFalse( 'lockdown', render.lockdown );
});


// Normalize path testing
munit( 'render._normalizePath', function( assert ) {
	assert.isFunction( 'Method Exists', render._normalizePath );

	[

		{
			name: 'Home Translation',
			before: "~/a/b/c",
			after: process.env.HOME + '/a/b/c'
		},

		{
			name: 'CWD',
			before: "cwd/path",
			after: process.cwd() + '/cwd/path'
		},

		{
			name: 'Nothing',
			before: "/a/root/path",
			after: "/a/root/path"
		}

	].forEach(function( object ) {
		assert.equal( object.name, render._normalizePath( object.before ), object.after );
	});
});


// Recursive mkdir testing
munit( 'render._mkdir', 7, function( assert ) {
	render._mkdir( __dirname, function( e ) {
		assert.empty( '__dirname should not throw any errors', e );
	});

	render._mkdir( __dirname + '/_mkdir/a/b/c', function( e ) {
		assert.empty( 'New path should not throw any errors', e );

		var path = __dirname;
		[ '_mkdir', 'a', 'b', 'c' ].forEach(function( dir ) {
			path += '/' + dir;
			fs.stat( path, function( e, stat ) {
				if ( ! stat || ! stat.isDirectory() ) {
					assert.fail( "mkdir depth, " + dir, null );
				}
				else {
					assert.pass( "mkdir depth, " + dir );
				}
			});
		});
	});

	render._mkdir( __filename, function( e ) {
		assert.isError( "Fail when creating directory on file", e );
	});
});
