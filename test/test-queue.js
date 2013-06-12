var queue = MUNIT.queue;

munit( 'queue.core', { priority: munit.PRIORITY_HIGHEST }, function( assert ) {
	assert.isFunction( 'queue namespace', queue )
		.isFalse( 'running', queue.running )
		.isFalse( 'waiting', queue.waiting )
		.isArray( 'objects', queue.objects )
		.isArray( 'modules', queue.modules )
		.isFunction( 'add', queue.add )
		.isFunction( 'remove', queue.remove )
		.isFunction( 'sort', queue.sort )
		.isFunction( 'check', queue.check );

	// Arguments testing
	[

		{
			name: 'Basic Args',
			args: [ 'My Test', munit.noop ],
			match: [ 'My Test', { queue: true }, munit.noop ]
		},

		{
			name: 'Expect Param Arg',
			args: [ 'My Test', 8, munit.noop ],
			match: [ 'My Test', { queue: true, expect: 8 }, munit.noop ]
		},

		{
			name: 'String Queue Arg',
			args: [ 'My Test', "Flag", munit.noop ],
			match: [ 'My Test', { queue: "Flag" }, munit.noop ]
		},

		{
			name: 'Empty Options Arg',
			args: [ 'My Test', null, munit.noop ],
			match: [ 'My Test', { queue: true }, munit.noop ]
		},

		{
			name: 'Regular Options Arg',
			args: [ 'My Test', { expect: 15 }, munit.noop ],
			match: [ 'My Test', { queue: true, expect: 15 }, munit.noop ]
		},

		{
			name: 'No Alterations Args',
			args: [ 'My Test', { expect: 15, queue: true }, munit.noop ],
			match: [ 'My Test', { queue: true, expect: 15 }, munit.noop ]
		}

	].forEach(function( object ) {
		var _module = MUNIT.module;

		// Duck punch for testing
		MUNIT.module = function( name, options, callback ) {
			assert.deepEqual( object.name, [ name, options, callback ], object.match );
		};
		MUNIT.queue.apply( MUNIT, object.args );

		// Reapply original module
		MUNIT.module = _module;
	});
});
