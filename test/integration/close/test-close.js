munit( 'Integration.close', 7, function( assert ) {
	var now = 0, syncFlag = false;

	MUNIT( 'sync',
		{
			teardown: function( m, callback ) {
				assert.isFalse( 'teardown should be triggered right away', syncFlag );
				callback();
			}
		},
		function( module ) {
			module.pass( 'first test' );
			module.close();
			syncFlag = true;
		}
	);

	MUNIT( 'async',
		{
			timeout: 3000,
			teardown: function( m, callback ) {
				assert.lessThan( 'module should close faster than 1 second', Date.now() - now, 1000 );
				callback();
			}
		},
		function( module ) {
			module.pass( 'first test' );
			setTimeout(function(){
				now = Date.now();
				module.pass( 'nested' );
				module.close();
			}, 100 );
		}
	);

	MUNIT.render(function( e, m ) {
		assert.empty( 'no error', e );
		assert.equal( 'correct munit passed back', m, MUNIT );
		assert.equal( 'only 3 tests applied for defined focus paths', MUNIT.passed, 3 );
		assert.equal( 'no failed tests', MUNIT.failed, 0 );
		assert.equal( 'no skipped tests', MUNIT.skipped, 0 );
	});
});

