var MUnit = require( '../' );

// Add queue object
MUnit.Queue.add({ key1: 123 });
MUnit.Queue.add({ key2: 456 });

// Sync waiter
MUnit.Queue( 'Waiter1', 'key1', function( settings, assert ) {
	assert.equal( 'key', settings.key1, 123 );
});

// Asnyc Waiter
MUnit.Queue( 'Waiter2', 'key2', function( settings, assert ) {
	assert.equal( 'key', settings.key2, 456 );
});

MUnit.render();
