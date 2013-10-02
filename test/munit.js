// Globalize munit and Compressor objects
global.munit = require( 'munit' );
global.MUNIT = require( '../' );

// Add on integration queue object for serial test running
munit.queue.add({ integration: true });

// Default all integration tests to be on a delay
munit( 'Integration', {

	timeout: 10000,
	queue: 'integration',

	setup: function( assert, callback ) {
		setTimeout(function(){
			// Reset munit the best we can
			MUNIT.extend({
				ns: {},
				passed: 0,
				failed: 0,
				skipped: 0,
				tests: [],
				start: 0,
				end: 0,
				_focus: [],
				_options: {}
			});

			// Reset render states
			MUNIT.extend( MUNIT.render, {
				state: MUNIT.RENDER_STATE_DEFAULT
			});

			// Auto block logging
			assert.data.logSpy = assert.spy( MUNIT, 'log' );

			// Allow test to run
			callback();
		}, 10 );
	}

});
