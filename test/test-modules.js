munit( 'munit._module', { priority: munit.PRIORITY_HIGHER } );
var Slice = Array.prototype.slice;


// Right now the munit() function is just a pass through function.
// If that changes, then new tests need to be applied
munit( 'munit._module.munit function', function( assert ) {
	var _module = MUNIT._module;

	[

		{
			name: 'Basic',
			args: [ 'a.b.c', 10, munit.noop ],
			match: [ 'a.b.c', 10, munit.noop ]
		},

		{
			name: 'Only name and function',
			args: [ 'a.b.c', munit.noop ],
			match: [ 'a.b.c', munit.noop, undefined ]
		},

		{
			name: 'Only name',
			args: [ 'a.b.c' ],
			match: [ 'a.b.c', undefined, undefined ]
		},

		{
			name: 'Only name and opitons',
			args: [ 'a.b.c', { expect: 10 } ],
			match: [ 'a.b.c', { expect: 10 }, undefined ]
		}

	].forEach(function( object ) {
		MUNIT._module = function( name, options, callback ) {
			assert.deepEqual(
				object.name,
				Slice.call( arguments ),
				object.match
			);
		};
		MUNIT.apply( MUNIT, object.args );
	});

	// Reassign module handle
	MUNIT._module = _module;
});


// Testing module creation argument handling
munit( 'munit._module.function', function( assert ) {
	var _createModule = MUNIT._createModule;

	// Once active, can't add more modules
	MUNIT._createModule = munit.noop;
	MUNIT.render.lockdown = true;
	assert.throws( "Can't add modules when in lockdown", /munit test modules have already been compiled/, function(){
		MUNIT._module( 'a.b.c' );
	});
	MUNIT.render.lockdown = false;

	// Basic argument pass-throughs
	[

		{
			name: 'basic',
			args: [ 'a.b.c' ],
			match: [ 'a.b.c', undefined, undefined ]
		},

		{
			name: 'name and callback',
			args: [ 'a.b.c', munit.noop ],
			match: [ 'a.b.c', undefined, munit.noop ]
		},

		{
			name: 'expect in options',
			args: [ 'a.b.c', 10, munit.noop ],
			match: [ 'a.b.c', { expect: 10 }, munit.noop ]
		},

		{
			name: 'just options',
			args: [ 'a.b.c', { expect: 10, priority: munit.PRIORITY_HIGHER } ],
			match: [ 'a.b.c', { expect: 10, priority: munit.PRIORITY_HIGHER }, undefined ]
		},

		{
			name: 'options and callback',
			args: [ 'a.b.c', { expect: 10, priority: munit.PRIORITY_HIGHER }, munit.noop ],
			match: [ 'a.b.c', { expect: 10, priority: munit.PRIORITY_HIGHER }, munit.noop ]
		},

		{
			name: 'array of modules',
			args: [[
				{
					name: 'a.b.c',
					options: { expect: 10 },
					callback: munit.noop
				},
				{
					name: 'a.b.c',
					options: 25,
					callback: munit.noop
				},
				{
					name: 'a.b.c',
					callback: munit.noop
				}
			]],
			multiMatch: [
				[ 'a.b.c', { expect: 10 }, munit.noop ],
				[ 'a.b.c', { expect: 25 }, munit.noop ],
				[ 'a.b.c', undefined, munit.noop ]
			]
		},

		{
			name: 'object of modules',
			args: [{
				'a.b.c1': munit.noop,
				'a.b.c2': munit.noop
			}],
			multiMatch: [
				[ 'a.b.c1', undefined, munit.noop ],
				[ 'a.b.c2', undefined, munit.noop ]
			]
		},

		{
			name: 'options and object of modules',
			args: [{ isAsync: true }, {
				'a.b.c1': munit.noop,
				'a.b.c2': munit.noop
			}],
			multiMatch: [
				[ 'a.b.c1', { isAsync: true }, munit.noop ],
				[ 'a.b.c2', { isAsync: true }, munit.noop ]
			]
		},

		{
			name: 'object of modules with name and options',
			args: [ 'a.b', { expect: 10 }, {
				'c1': munit.noop,
				'c2': munit.noop
			}],
			multiMatch: [
				[ 'a.b.c1', { expect: 10 }, munit.noop ],
				[ 'a.b.c2', { expect: 10 }, munit.noop ]
			]
		},

		{
			name: 'object of modules with just name',
			args: [ 'a.b', {
				'c1': munit.noop,
				'c2': munit.noop
			}],
			multiMatch: [
				[ 'a.b.c1', undefined, munit.noop ],
				[ 'a.b.c2', undefined, munit.noop ]
			]
		}

	].forEach(function( object ) {
		var index = 0;

		MUNIT._createModule = function(){
			assert.deepEqual(
				object.name + ( object.hasOwnProperty( 'multiMatch' ) ? '-' + index : '' ),
				Slice.call( arguments ),
				object.multiMatch ?
					object.multiMatch.length ? object.multiMatch.shift() : [] :
					object.match
			);
			index++;
		};
		MUNIT._module.apply( MUNIT, object.args );
	});

	// Reassign module handle
	MUNIT._createModule = _createModule;
});


// Testing actual module creation
munit( 'munit._module._createModule', function( assert ) {
	var _ns = MUNIT.ns, module;

	// Module declaration
	MUNIT.ns = {};
	MUNIT._createModule( "a.b.c" );
	assert.exists( "Depth A", MUNIT.ns.a );
	assert.exists( "Depth B", MUNIT.ns.a.ns.b );
	assert.exists( "Depth C", MUNIT.ns.a.ns.b.ns.c );

	// Module with callback
	MUNIT.ns = {};
	MUNIT._createModule( "a.b", undefined, munit.noop );
	assert.exists( "Trigger A", MUNIT.ns.a );
	assert.empty( "Trigger A - no callback", MUNIT.ns.a.callback );
	assert.exists( "Trigger B", MUNIT.ns.a.ns.b );
	assert.equal( "Trigger B - callback", MUNIT.ns.a.ns.b.callback, munit.noop );

	// Throw an error when attempting to create a module that already exists
	assert.throws( "Block Multiple Modules", /'a.b' module has already been created/, function(){
		MUNIT._createModule( "a.b", undefined, munit.noop );
	});

	// Test options getting passed down the chain
	MUNIT.ns = {};
	MUNIT._createModule( "a.b", { timeout: 555, stopOnFail: true, expect: 10 } );
	module = MUNIT._createModule( "a.b.c", { stopOnFail: false }, munit.noop );
	assert.equal( "option passdown timeout", module.option( 'timeout' ), 555 );
	assert.equal( "option overwrite stopOnFail", module.option( 'stopOnFail' ), false );
	assert.equal( "option reset expect", module.option( 'expect' ), 0 );

	// Clear namespace after use
	MUNIT.ns = _ns;
});


// Testing quick async module creation
munit( 'munit._module.async', function( assert ) {
	var _module = MUNIT._module;

	// Arguments testing
	[

		{
			name: 'Basic Args',
			args: [ 'My Test', munit.noop ],
			match: [ 'My Test', { isAsync: true }, munit.noop ]
		},

		{
			name: 'Expect Param Arg',
			args: [ 'My Test', 8, munit.noop ],
			match: [ 'My Test', { isAsync: true, expect: 8 }, munit.noop ]
		},

		{
			name: 'Empty Options Arg',
			args: [ 'My Test', null, munit.noop ],
			match: [ 'My Test', { isAsync: true }, munit.noop ]
		},

		{
			name: 'Regular Options Arg',
			args: [ 'My Test', { expect: 15 }, munit.noop ],
			match: [ 'My Test', { isAsync: true, expect: 15 }, munit.noop ]
		},

		{
			name: 'No Alterations Args',
			args: [ 'My Test', { expect: 15, isAsync: true }, munit.noop ],
			match: [ 'My Test', { isAsync: true, expect: 15 }, munit.noop ]
		}

	].forEach(function( object ) {
		MUNIT._module = function( name, options, callback ) {
			assert.deepEqual( object.name, [ name, options, callback ], object.match );
		};
		MUNIT.async.apply( MUNIT, object.args );
	});

	// Reapply original module
	MUNIT._module = _module;
});
