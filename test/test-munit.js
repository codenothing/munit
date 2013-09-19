munit( "munit.core", { priority: 1.0 }, function( assert ) {
	assert.isFunction( 'munit', MUNIT );
	assert.isFunction( 'custom', MUNIT.custom );
	assert.isFunction( 'AssertionError', MUNIT.AssertionError );
	assert.isFunction( 'Assert', MUNIT.Assert );
	assert.isFunction( 'AssertResult', MUNIT.AssertResult );
	assert.isFunction( 'cli', MUNIT.cli );

	// Meta
	assert.isString( 'version', MUNIT.version );
	assert.isFunction( 'noop', MUNIT.noop );
	assert.isObject( 'namespace', MUNIT.ns );
	assert.equal( 'passed', MUNIT.passed, 0 );
	assert.equal( 'failed', MUNIT.failed, 0 );
	assert.equal( 'start', MUNIT.start, 0 );
	assert.equal( 'end', MUNIT.end, 0 );
	assert.isArray( 'customReserved', MUNIT.customReserved );

	// Priorities
	assert.isNumber( 'Priority Highest', MUNIT.PRIORITY_HIGHEST );
	assert.isNumber( 'Priority Higher', MUNIT.PRIORITY_HIGHER );
	assert.isNumber( 'Priority High', MUNIT.PRIORITY_HIGH );
	assert.isNumber( 'Priority Default', MUNIT.PRIORITY_DEFAULT );
	assert.isNumber( 'Priority Low', MUNIT.PRIORITY_LOW );
	assert.isNumber( 'Priority Lower', MUNIT.PRIORITY_LOWER );
	assert.isNumber( 'Priority Lowest', MUNIT.PRIORITY_LOWEST );
});


// Custom tests
munit( 'munit.custom', { priority: munit.PRIORITY_LOWEST }, function( assert ) {
	var module = MUNIT( 'a.b.c' );

	// Blocking on reserved words
	assert.throws(
		'Block on reserved words',
		/'once' is a reserved name and cannot be added as a custom assertion test/,
		function(){
			MUNIT.custom( "once", MUNIT.noop );
		}
	);

	// Basic Addition
	assert.empty( 'Initial check', MUNIT.Assert.prototype.customTest );
	MUNIT.custom( 'customTest', function(){});
	assert.isFunction( 'customTest prototype', MUNIT.Assert.prototype.customTest );
	assert.isFunction( 'customTest module', module.customTest );

	// Overwriting existing functions
	assert.notEqual( "Current custom doesn't match", module.customTest, munit.noop );
	MUNIT.custom( 'customTest', munit.noop );
	assert.equal( "Custom test now matches", module.customTest, munit.noop );
});
