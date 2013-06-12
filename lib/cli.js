var munit = global.munit,
	argv = require( 'argv' );

argv.version( munit.version )
	.info( "Usage: munit [options] [render]" );


// Expose
munit.cli = function( args ) {
	args = argv.clear().option( munit.defaults.argv ).run( args || process.argv.slice( 2 ) );

	// Only target allowed is the path to render
	if ( args.targets.length ) {
		args.options.render = args.targets[ 0 ];
	}
	// No render option means run in the current directory
	else if ( ! args.options.render ) {
		args.options.render = process.cwd() + '/';
	}

	munit.render( args.options );
};
