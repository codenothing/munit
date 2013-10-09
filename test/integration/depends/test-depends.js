munit( 'Integration.depends', 8, function( assert ) {
	var step = -1,
		STEP_A = 1,
		STEP_B = 2,
		STEP_C = 3,
		STEP_D = 4;

	MUNIT( 'step.a', { depends: 'step.c' }, function( module ) {
		assert.equal( 'in step.a', step, STEP_C );
		step = STEP_A;

		module.pass( 'inner test' );
	});

	MUNIT( 'step.b', { depends: 'step.d' }, function( module ) {
		assert.equal( 'in step.b', step, STEP_D );
		step = STEP_B;

		module.pass( 'inner test' );
	});

	MUNIT( 'step.c', { depends: 'step.b' }, function( module ) {
		assert.equal( 'in step.c', step, STEP_B );
		step = STEP_C;

		module.pass( 'inner test' );
	});

	MUNIT( 'step.d', function( module ) {
		assert.equal( 'in step.d (starter)', step, -1 );
		step = STEP_D;

		module.pass( 'inner test' );
	});

	MUNIT( 'step.e', { depends: [ 'step.c', 'step.d' ] }, function( module ) {
		assert.pass( 'multi depends module triggered' );
		module.pass( 'inner test' );
	});

	MUNIT.render(function( e, m ) {
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'final step is A', step, STEP_A );
	});
});
