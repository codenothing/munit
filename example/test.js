var munit = require( '../' );

munit( 'Sync', function( assert ) {
	assert.pass( 'sync-example' );
	assert.ok( 'boolean-test', true );
});

munit( 'Async', 2, function( assert ) {
	process.nextTick(function(){
		assert.equal( 'first-tick', 15.0, 15.0 );
		process.nextTick(function(){
			assert.pass( 'next-tick' );
		});
	});
});

munit.render();
