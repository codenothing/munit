var munit = require( '../' );

// Add queue object
munit.queue.add({ key1: 123 });
munit.queue.add({ key2: 456 });

// Sync waiter
munit.queue( 'Waiter1', 'key1', function( settings, assert ) {
	assert.equal( 'key', settings.key1, 123 );
});

// Asnyc Waiter
munit.queue( 'Waiter2', 'key2', function( settings, assert ) {
	assert.equal( 'key', settings.key2, 456 );
});

munit.render();
