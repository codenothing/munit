var MUnit = require( '../' );

// Add queue object
MUnit.Queue.add({ flag: true });

// Sync waiter
MUnit.Queue( 'Waiter1', function( settings, assert ) {
	assert.equal( 'flag', settings.flag, true );
});

// Asnyc Waiter
MUnit.Queue( 'Waiter2', 1, function( settings, assert ) {
	process.nextTick(function(){
		assert.equal( 'flag', settings.flag, true );
	});
});

MUnit.render();
