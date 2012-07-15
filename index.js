var _MUnit = global.MUnit;

// Globalizing so that all libs use the same MUnit object
// Global object will be removed by end of script
global.MUnit = module.exports = require( './lib/MUnit.js' );


// All libs are assumed to be prefixed to the lib directory
[

	'Defaults.js',
	'Assert.js',
	'Queue.js',
	'Cli.js',
	'Color.js'

].forEach(function( lib ) {
	require( './lib/' + lib );
});


// Reset global var
global.MUnit = _MUnit;
