var munit = global.munit,
	argv = require( 'argv' );

argv.version( munit.version )
	.info( "Usage: munit [options] [render]" );


munit.cli = function( args ) {
	args = argv.clear().option( munit.Defaults.argv ).run();

	// For now, just render what you see
	if ( args.options.render ) {
		munit.render( args.options.render );
	}
	else if ( args.targets.length ) {
		munit.render( args.targets[ 0 ] );
	}
	else {
		munit.render( process.cwd() + '/' );
	}
};
