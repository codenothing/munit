munit.queue( 'Integration.delay', 7, function( queue, assert ) {
	MUNIT( 'single', function( module ) {
		module.delay( 50, function( m ) {
			assert.equal( 'current module passed to callback', m, module );
			module.pass( 'first test' );
		});
	});

	MUNIT( 'nested', function( module ) {
		module.delay( 50, function(){
			module.pass( 'first level' );
			module.delay( 50, function(){
				module.pass( 'second level' );
				module.delay( 50, function(){
					module.pass( 'third and last level' );
					assert.pass( 'third nested level reached' );
				});
			});
		});
	});

	MUNIT( 'extend', { timeout: 50 }, function( module ) {
		module.delay( 100, function(){
			module.pass( 'extension' );
			assert.pass( 'extension met' );
		});
	});

	MUNIT.render(function( e, m ) {
		assert.log( MUNIT.tests, e );
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'all tests met', MUNIT.passed, 5 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
	});
});
