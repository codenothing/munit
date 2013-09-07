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
