var Slice = Array.prototype.slice;

munit( 'munit.module', { priority: munit.PRIORITY_HIGHER }, {

	// Right now the munit() function is just a pass through function.
	// If that changes, then new tests need to be applied
	'munit function': function( assert ) {
		var spy = assert.spy( MUNIT, '_module' );

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
			MUNIT.apply( MUNIT, object.args );
			assert.deepEqual( object.name, spy.args, object.match );
		});
	},

	// Testing module creation argument handling
	_module: function( assert ) {
		var spy = assert.spy( MUNIT, '_createModule' ),
			_state = MUNIT.render.state;

		// Once active, can't add more modules
		MUNIT.render.state = MUNIT.RENDER_STATE_COMPILE;
		assert.throws( "Can't add modules when past read state", /munit is compiling the test modules/, function(){
			MUNIT._module( 'a.b.c', 4 );
		});
		assert.equal( "_createModule should not have been called", spy.count, 0 );
		MUNIT.render.state = _state;

		// Basic argument pass-throughs
		[

			{
				name: 'basic',
				args: [ 'a.b.c' ],
				match: [ 'a.b.c', {}, undefined ]
			},

			{
				name: 'name and callback',
				args: [ 'a.b.c', munit.noop ],
				match: [ 'a.b.c', {}, munit.noop ]
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
					[ 'a.b.c', {}, munit.noop ]
				]
			},

			{
				name: 'array of modules with extra',
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
				], undefined, undefined, { timeout: 1000 } ],
				multiMatch: [
					[ 'a.b.c', { expect: 10, timeout: 1000 }, munit.noop ],
					[ 'a.b.c', { expect: 25, timeout: 1000 }, munit.noop ],
					[ 'a.b.c', { timeout: 1000 }, munit.noop ]
				]
			},

			{
				name: 'object of modules',
				args: [{
					'a.b.c1': munit.noop,
					'a.b.c2': munit.noop
				}],
				multiMatch: [
					[ 'a.b.c1', {}, munit.noop ],
					[ 'a.b.c2', {}, munit.noop ]
				]
			},

			{
				name: 'object of modules with extra',
				args: [{
					'a.b.c1': munit.noop,
					'a.b.c2': munit.noop
				}, undefined, undefined, { queue: true } ],
				multiMatch: [
					[ 'a.b.c1', { queue: true }, munit.noop ],
					[ 'a.b.c2', { queue: true }, munit.noop ]
				]
			},

			{
				name: 'options and object of modules',
				args: [{ timeout: 1000 }, {
					'a.b.c1': munit.noop,
					'a.b.c2': munit.noop
				}],
				multiMatch: [
					[ 'a.b.c1', { timeout: 1000 }, munit.noop ],
					[ 'a.b.c2', { timeout: 1000 }, munit.noop ]
				]
			},

			{
				name: 'options and object of modules with extra',
				args: [{ timeout: 1000 }, {
					'a.b.c1': munit.noop,
					'a.b.c2': munit.noop
				}, undefined, { queue: 'foo' } ],
				multiMatch: [
					[ 'a.b.c1', { timeout: 1000, queue: 'foo' }, munit.noop ],
					[ 'a.b.c2', { timeout: 1000, queue: 'foo' }, munit.noop ]
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
				name: 'object of modules, name, and options with extra',
				args: [ 'a.b', { expect: 10 }, {
					'c1': munit.noop,
					'c2': munit.noop
				}, { timeout: 1000 }],
				multiMatch: [
					[ 'a.b.c1', { expect: 10, timeout: 1000 }, munit.noop ],
					[ 'a.b.c2', { expect: 10, timeout: 1000 }, munit.noop ]
				]
			},

			{
				name: 'object of modules with just name',
				args: [ 'a.b', {
					'c1': munit.noop,
					'c2': munit.noop
				}],
				multiMatch: [
					[ 'a.b.c1', {}, munit.noop ],
					[ 'a.b.c2', {}, munit.noop ]
				]
			},

			{
				name: 'object of modules with just name and extra',
				args: [ 'a.b', {
					'c1': munit.noop,
					'c2': munit.noop
				}, undefined, { expect: 10 }],
				multiMatch: [
					[ 'a.b.c1', { expect: 10 }, munit.noop ],
					[ 'a.b.c2', { expect: 10 }, munit.noop ]
				]
			},

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
	},

	// Module getter
	_getModule: function( assert ) {
		assert.spy( MUNIT, 'ns' );

		// Generate new modules
		MUNIT.ns = {};
		MUNIT( 'a.b.c' );
		MUNIT( 'e.f' );
		MUNIT( 'z' );

		// Run getter tests
		[

			{
				name: 'First Level',
				path: 'z',
				match: MUNIT.ns.z
			},

			{
				name: 'Second Level',
				path: 'e.f',
				match: MUNIT.ns.e.ns.f
			},

			{
				name: 'Third Level',
				path: 'a.b.c',
				match: MUNIT.ns.a.ns.b.ns.c
			},

			{
				name: 'Inbetween Level',
				path: 'a.b',
				match: MUNIT.ns.a.ns.b
			},

			{
				name: 'No Match',
				path: 'not_there',
				error: /Module path not found 'not_there'/
			},

			{
				name: 'No Match Nested',
				path: 'a.b.c.g.f',
				error: /Module path not found 'a.b.c.g.f'/
			},

			{
				name: 'No Path',
				path: '',
				error: /Module path not found ''/
			},

		].forEach(function( object ) {
			if ( object.error ) {
				assert.throws( object.name, object.error, function(){
					MUNIT._getModule( object.path );
				});
			}
			else {
				assert.equal( object.name, MUNIT._getModule( object.path ), object.match );
			}
		});
	},

	// Testing actual module creation
	_createModule: function( assert ) {
		var module;
		assert.spy( MUNIT, 'ns' );

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
	},

	// Testing quick async module creation
	async: function( assert ) {
		var spy = assert.spy( MUNIT, '_module' );

		// Arguments testing
		[

			{
				name: 'Basic Args',
				args: [ 'My Test', munit.noop ],
				match: [ 'My Test', munit.noop, undefined, { timeout: 3000 } ]
			},

			{
				name: 'Expect Param Arg',
				args: [ 'My Test', 8, munit.noop ],
				match: [ 'My Test', 8, munit.noop, { timeout: 3000 } ]
			},

			{
				name: 'Empty Options Arg',
				args: [ 'My Test', null, munit.noop ],
				match: [ 'My Test', null, munit.noop, { timeout: 3000 } ]
			},

			{
				name: 'Regular Options Arg',
				args: [ 'My Test', { expect: 15 }, munit.noop ],
				match: [ 'My Test', { expect: 15 }, munit.noop, { timeout: 3000 } ]
			},

			{
				name: 'No Alterations Args',
				args: [ 'My Test', { expect: 15, timeout: 5000 }, munit.noop ],
				match: [ 'My Test', { expect: 15, timeout: 5000 }, munit.noop, { timeout: 3000 } ]
			}

		].forEach(function( object ) {
			MUNIT.async.apply( MUNIT, object.args );
			assert.deepEqual( object.name, spy.args, object.match );
		});
	},

	// Testing depends module creation
	depends: function( assert ) {
		var spy = assert.spy( MUNIT, '_module' );

		// Success string
		assert.doesNotThrow( 'successful string addition', function(){
			MUNIT.depends( 'test-name', 'test-depends', munit.noop );
		});
		assert.equal( '_module triggered', spy.count, 1 );
		assert.deepEqual( '_module args', spy.args, [ 'test-name', { depends: 'test-depends' }, munit.noop ] );

		// Success array
		assert.doesNotThrow( 'successful array addition', function(){
			MUNIT.depends( 'test-name', [ 'core', 'util' ], munit.noop );
		});
		assert.equal( '_module array triggered', spy.count, 2 );
		assert.deepEqual( '_module array args', spy.args, [ 'test-name', { depends: [ 'core', 'util' ] }, munit.noop ] );

		// Failures
		assert.throws( "throws when string or array isn't passed", "Depends argument not found", function(){
			MUNIT.depends( 'test-name', null, munit.noop );
		});
		assert.throws( "throws when string is empty", "Depends argument not found", function(){
			MUNIT.depends( 'test-name', '', munit.noop );
		});
		assert.throws( "throws when array is empty", "Depends argument not found", function(){
			MUNIT.depends( 'test-name', [], munit.noop );
		});
	}

});
