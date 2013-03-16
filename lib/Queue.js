var MUnit = global.MUnit;

function Queue( name, options, callback ) {
	if ( callback === undefined ) {
		callback = options;
		options = { queue: true };
	}
	else if ( MUnit.isNumber( options ) ) {
		options = { queue: true, expect: options };
	}
	else if ( MUnit.isString( options ) ) {
		options = { queue: options };
	}
	else if ( ! MUnit.isObject( options ) ) {
		options = { queue: true };
	}
	else if ( ! options.queue ) {
		options.queue = true;
	}

	return MUnit( name, options, callback );
}

MUnit.extend( Queue, {

	// Setup
	running: false,
	waiting: false,
	objects: [],
	modules: [],

	// Re-adds object to stack, and checks to see if any modules could use it
	add: function( object ) {
		Queue.objects.push( object );
		Queue.check();
	},

	// Remove queue object from stack (if it exists)
	remove: function( object ) {
		var index = Queue.objects.indexOf( object );

		if ( index > -1 ) {
			Queue.objects.splice( index, 1 );
		}
		else if ( MUnit.isString( object ) ) {
			MUnit.each( Queue.objects, function( entry, i ) {
				if ( entry[ object ] ) {
					Queue.objects.splice( i, 1 );
					return false;
				}
			});
		}
	},

	// Sorts modules
	sort: function(){
		Queue.modules.sort(function( a, b ) {
			if ( a.options.priority === b.options.priority ) {
				return a._added === b._added ? 0 :
					a._added > b._added ? 1 :
					-1;
			}
			else {
				return a.options.priority > b.options.priority ? -1 : 1;
			}
		});
	},

	// Runs through queued modules and finds objects to run them with
	check: function(){
		var found = true, copy = [];


		// Handle recursive loops
		if ( Queue.running ) {
			Queue.waiting = true;
			return;
		}

		// Mark queue as running, then search for 
		Queue.running = true;
		MUnit.each( Queue.modules, function( assert, index ) {
			if ( ! Queue.objects.length ) {
				return false;
			}

			// Looking for specific key in queue object
			if ( MUnit.isString( assert.options.queue ) ) {
				MUnit.each( Queue.objects, function( object, i ) {
					if ( object[ assert.options.queue ] ) {
						Queue.modules[ index ] = null;
						Queue.objects.splice( i, 1 );
						assert.queue = object;
						assert.callback( object, assert );
						found = true;
						return false;
					}
				});
			}
			// Any queue will do
			else {
				Queue.modules[ index ] = null;
				assert.queue = Queue.objects.shift();
				assert.callback( assert.queue, assert );
				found = true;
			}

			// If queue is found for assert object, then mark it
			if ( found && ! assert._closed ) {
				// No limit on expected tests, assume synchronous
				// And if timeout is explicetely null'd out, assume synchronous
				if ( ! assert.options.expect || ! assert.options.timeout ) {
					assert.close();
				}
				// Attach timeout while the module is running
				else {
					assert._timeid = setTimeout(function(){
						if ( ! assert._closed ) {
							assert.close();
						}
					}, assert.options.timeout);
				}
			}
		});

		// Clean out modules that completed (splicing causes iteration fails)
		Queue.modules.forEach(function( assert ) {
			if ( assert !== null ) {
				copy.push( assert );
			}
		});
		Queue.modules = copy;

		// Run again if check method was called during loop
		Queue.running = false;
		if ( Queue.waiting ) {
			Queue.waiting = false;
			Queue.check();
		}
	}

});


// Expose
MUnit.Queue = Queue;
