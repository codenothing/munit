var MUnit = global.MUnit,
	argv = require( 'argv' );

argv.version( MUnit.version )
	.info( "Usage: munit [options] [render]" );


MUnit.Cli = function( args ) {
	args = argv.clear().option( MUnit.Defaults.argv ).run();

	// For now, just render what you see
	if ( args.options.render ) {
		MUnit.render( args.options.render );
	}
	else if ( args.targets.length ) {
		MUnit.render( args.targets[ 0 ] );
	}
	else {
		MUnit.render( process.cwd() + '/' );
	}
};
