var munit = require( '../' );

// Add queue object
munit.queue.add({ flag: true });

// Sync waiter
munit.queue( 'Waiter1', function( settings, assert ) {
	assert.equal( 'flag', settings.flag, true );
});

// Asnyc Waiter
munit.queue( 'Waiter2', 1, function( settings, assert ) {
	process.nextTick(function(){
		assert.equal( 'flag', settings.flag, true );
	});
});

munit.render();
