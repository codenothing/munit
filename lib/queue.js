var munit = global.munit;

function queue( name, options, callback ) {
	var value = true;

	if ( munit.isString( options ) ) {
		value = options;
		options = undefined;
	}

	return munit._module( name, options, callback, { queue: value } );
}

munit.extend( queue, {

	// Setup
	running: false,
	waiting: false,
	objects: [],
	modules: [],

	// Re-adds object to stack, and checks to see if any modules could use it
	add: function( object ) {
		queue.objects.push( object );
		queue.check();
	},

	// Remove queue object from stack (if it exists)
	remove: function( object ) {
		var index = queue.objects.indexOf( object ),
			remove = [];

		if ( index > -1 ) {
			queue.objects.splice( index, 1 );
		}
		else if ( munit.isString( object ) ) {
			queue.objects.forEach(function( entry ) {
				if ( entry[ object ] ) {
					remove.push( entry );
				}
			});

			remove.forEach(function( entry ) {
				if ( ( index = queue.objects.indexOf( entry ) ) > -1 ) {
					queue.objects.splice( index, 1 );
				}
			});
		}
	},

	// Adding test modules to the queue
	addModule: function( module ) {
		queue.modules.push( module );
		queue.check();
	},

	// Runs through queued modules and finds objects to run them with
	check: function(){
		var copy = [];

		// Handle recursive loops
		if ( queue.running ) {
			queue.waiting = true;
			return;
		}

		// Mark queue as running, then search for 
		queue.running = true;
		munit.each( queue.modules, function( assert, index ) {
			if ( ! queue.objects.length ) {
				return false;
			}
			else if ( ! munit.render.checkDepency( assert ) ) {
				return;
			}

			// Looking for specific key in queue object
			if ( munit.isString( assert.options.queue ) ) {
				munit.each( queue.objects, function( object, i ) {
					if ( object[ assert.options.queue ] ) {
						queue.modules[ index ] = null;
						queue.objects.splice( i, 1 );
						assert.queue = object;
						assert.trigger();
						return false;
					}
				});
			}
			// Any queue will do
			else {
				queue.modules[ index ] = null;
				assert.queue = queue.objects.shift();
				assert.trigger();
			}
		});

		// Clean out modules that completed (splicing causes iteration fails)
		queue.modules.forEach(function( assert ) {
			if ( assert !== null ) {
				copy.push( assert );
			}
		});
		queue.modules = copy;

		// Run again if check method was called during loop
		queue.running = false;
		if ( queue.waiting ) {
			queue.waiting = false;
			queue.check();
		}
	}

});


// Expose
munit.queue = queue;
