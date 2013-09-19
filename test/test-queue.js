var queue = MUNIT.queue;

munit( 'queue.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	var spy = assert.spy( MUNIT, '_module' );

	// Type checks
	assert.isFunction( 'queue namespace', queue )
		.isFalse( 'running', queue.running )
		.isFalse( 'waiting', queue.waiting )
		.isArray( 'objects', queue.objects )
		.isArray( 'modules', queue.modules )
		.isFunction( 'add', queue.add )
		.isFunction( 'remove', queue.remove )
		.isFunction( 'addModule', queue.addModule )
		.isFunction( 'check', queue.check );

	// Arguments testing
	[

		{
			name: 'Basic Args',
			args: [ 'My Test', munit.noop ],
			match: [ 'My Test', munit.noop, undefined, { queue: true } ]
		},

		{
			name: 'Expect Param Arg',
			args: [ 'My Test', 8, munit.noop ],
			match: [ 'My Test', 8, munit.noop, { queue: true } ]
		},

		{
			name: 'String Queue Arg',
			args: [ 'My Test', "Flag", munit.noop ],
			match: [ 'My Test', undefined, munit.noop, { queue: "Flag" } ]
		},

		{
			name: 'Empty Options Arg',
			args: [ 'My Test', null, munit.noop ],
			match: [ 'My Test', null, munit.noop, { queue: true } ]
		},

		{
			name: 'Regular Options Arg',
			args: [ 'My Test', { expect: 15 }, munit.noop ],
			match: [ 'My Test', { expect: 15 }, munit.noop, { queue: true } ]
		},

		{
			name: 'No Alterations Args',
			args: [ 'My Test', { expect: 15, queue: true }, munit.noop ],
			match: [ 'My Test', { expect: 15, queue: true }, munit.noop, { queue: true } ]
		}

	].forEach(function( object ) {
		MUNIT.queue.apply( MUNIT, object.args );
		assert.deepEqual( object.name, spy.args, object.match );
	});
});


munit( 'queue', {

	add: function( assert ) {
		var _objects = queue.objects,
			checkSpy = assert.spy( queue, 'check' );

		queue.objects = [];
		queue.add({ port: 1234 });
		assert.deepEqual( 'object added', queue.objects, [ { port: 1234 } ] );
		assert.equal( 'check triggered', checkSpy.count, 1 );

		// Reset
		queue.objects = _objects;
	},

	remove: function( assert ) {
		var _objects = queue.objects,
			obj1 = { port: 1234, special: true },
			obj2 = { port: 4321 },
			obj3 = { port: 1337, special: true };

		// Single object
		queue.objects = [ obj1, obj2, obj3 ];
		queue.remove( obj2 );
		assert.deepEqual( 'single object removal', queue.objects, [ obj1, obj3 ] );

		// Keyed object removal
		queue.objects = [ obj1, obj2, obj3 ];
		queue.remove( 'special' );
		assert.deepEqual( 'keyed object removal', queue.objects, [ obj2 ] );

		// Reset
		queue.objects = _objects;
	},

	addModule: function( assert ) {
		var _modules = queue.modules,
			module = new MUNIT.Assert( 'a.b.c' ),
			checkSpy = assert.spy( queue, 'check' );

		queue.modules = [];
		queue.addModule( module );
		assert.deepEqual( 'module added', queue.modules, [ module ] );
		assert.equal( 'check triggered', checkSpy.count, 1 );

		// Reset
		queue.modules = _modules;
	},

	check: function( assert ) {
		var _modules = queue.modules,
			_objects = queue.objects,
			_running = queue.running,
			_waiting = queue.waiting,
			_check = queue.check,
			dependSpy = assert.spy( MUNIT.render, 'checkDepency', { returnValue: false } ),
			checkSpy = assert.spy( queue, 'check' ),
			eachSpy = assert.spy( MUNIT, 'each', { passthru: true } ),
			isStringSpy = assert.spy( MUNIT, 'isString', { passthru: true } ),
			object1 = { port: 2431 },
			object2 = { port: 1234, special: true },
			module1 = new MUNIT.Assert( 'a.b.c1' ),
			module2 = new MUNIT.Assert( 'a.b.c2' ),
			trigger1 = assert.spy( module1, 'trigger' ),
			trigger2 = assert.spy( module2, 'trigger' );

		// Test quick return when check is already running (prevents recursive loops)
		queue.running = true;
		_check.call( queue );
		assert.equal( 'munit.each not triggered', eachSpy.count, 0 );
		assert.isTrue( 'waiting state turned on when attempting to check while running', queue.waiting );

		// Test quick loop exit with no queue objects
		queue.running = queue.waiting = false;
		queue.modules = [ module1, module2 ];
		queue.objects = [];
		_check.call( queue );
		assert.equal( 'no object - munit.each triggered', eachSpy.count, 1 );
		assert.equal( 'no object - render.checkDepency not triggered', dependSpy.count, 0 );
		assert.deepEqual( 'no object - no modules triggered', queue.modules, [ module1, module2 ] );
		assert.equal( 'no object - queue.check not triggered again since nothing is waiting', checkSpy.count, 0 );
		assert.isFalse( 'no object - queue.running returned to false once check is complete', queue.running );

		// Test quick loop exit with no queue objects
		queue.running = queue.waiting = false;
		queue.modules = [ module1, module2 ];
		queue.objects = [ object1, object2 ];
		_check.call( queue );
		assert.equal( 'object fail depends - render.checkDepency triggered', dependSpy.count, 2 );
		assert.deepEqual( 'object fail depends - render.checkDepency first args', dependSpy.history[ 0 ].args, [ module1 ] );
		assert.deepEqual( 'object fail depends - render.checkDepency second args', dependSpy.history[ 1 ].args, [ module2 ] );
		assert.equal( 'object fail depends - munit.isString still not triggered, fails to early', isStringSpy.count, 0 );
		assert.deepEqual( 'object fail depends - no modules triggered', queue.modules, [ module1, module2 ] );
		assert.equal( 'object fail depends - queue.check not triggered again since nothing is waiting', checkSpy.count, 0 );

		// Test single queue object match
		dependSpy.option( 'returnValue', true );
		queue.running = queue.waiting = false;
		queue.modules = [ module1, module2 ];
		queue.objects = [ object1 ];
		_check.call( queue );
		assert.equal( 'single object match - module1 triggered', trigger1.count, 1 );
		assert.equal( 'single object match - queue object applied to first module', module1.queue, object1 );
		assert.deepEqual( 'single object match - only non run modules are left', queue.modules, [ module2 ] );
		assert.deepEqual( 'single object match - all objects are removed', queue.objects, [] );

		// Test keyed queue object match
		queue.running = queue.waiting = false;
		queue.modules = [ module2, module1 ];
		queue.objects = [ object2 ];
		module2.options.queue = 'special';
		_check.call( queue );
		assert.equal( 'keyed object match - module2 triggered', trigger2.count, 1 );
		assert.equal( 'keyed object match - queue object applied to module2 with keyed queue', module2.queue, object2 );
		assert.deepEqual( 'keyed object match - only non run modules are left', queue.modules, [ module1 ] );
		assert.deepEqual( 'keyed object match - all objects are removed', queue.objects, [] );

		// Test waiting logic while running queues
		queue.running = queue.waiting = false;
		queue.modules = [ module1, module2 ];
		queue.objects = [ object1 ];
		queue.waiting = true;
		_check.call( queue );
		assert.equal( 'queue check triggered if in waiting state', checkSpy.count, 1 );
		assert.equal( 'queue waiting state flipped back to false', queue.waiting, false );


		// Reset
		queue.modules = _modules;
		queue.objects = _objects;
		queue.running = _running;
		queue.waiting = _waiting;
	}

});
