munit( 'assert.core', { priority: munit.PRIORITY_HIGHER } );

// Ensures all assertions exists
// THESE TESTS SHOULD NOT CHANGE WITHOUT HEAVY CONSIDERATION
munit( 'assert.core.init', function( assert ) {
	var parAssert = MUNIT.Assert( 'a.b' ),
		options = { expect: 10 },
		module = MUNIT.Assert( "a.b.c", parAssert, options, munit.noop );

	assert.equal( 'Namespace Path', module.nsPath, 'a.b.c' )
		.equal( 'Parent Assertion Module', module.parAssert, parAssert )
		.equal( 'options', module.options, options )
		.equal( 'state', module.state, MUNIT.ASSERT_STATE_DEFAULT )
		.isArray( 'test list', module.list )
		.isObject( 'test hash', module.tests )
		.isObject( 'Sub namespace container', module.ns )
		.isObject( 'Sub userspace container', module.data )
		.equal( 'test count', module.count, 0 )
		.equal( 'passed test count', module.passed, 0 )
		.equal( 'failed test count', module.failed, 0 )
		.equal( 'module callback', module.callback, munit.noop )
		.equal( 'module start time', module.start, 0 )
		.equal( 'module end time', module.end, 0 )
		.equal( 'async flag starts false', module.isAsync, false )
		.isFunction( "ok", module.ok )
		.isFunction( "pass", module.pass )
		.isFunction( "fail", module.fail )
		.isFunction( "isTrue", module.isTrue )
		.isFunction( "isFalse", module.isFalse )
		.isFunction( "isUndefined", module.isUndefined )
		.isFunction( "isNull", module.isNull )
		.isFunction( "isBoolean", module.isBoolean )
		.isFunction( "isNumber", module.isNumber )
		.isFunction( "isString", module.isString )
		.isFunction( "isFunction", module.isFunction )
		.isFunction( "isArray", module.isArray )
		.isFunction( "isDate", module.isDate )
		.isFunction( "isRegExp", module.isRegExp )
		.isFunction( "isObject", module.isObject )
		.isFunction( "isError", module.isError )
		.isFunction( "exists", module.exists )
		.isFunction( "empty", module.empty )
		.isFunction( "equal", module.equal )
		.isFunction( "notEqual", module.notEqual )
		.isFunction( "greaterThan", module.greaterThan )
		.isFunction( "lessThan", module.lessThan )
		.isFunction( "deepEqual", module.deepEqual )
		.isFunction( "notDeepEqual", module.notDeepEqual )
		.isFunction( "throws", module.throws )
		.isFunction( "doesNotThrow", module.doesNotThrow )
		.isFunction( "requireState", module.requireState )
		.isFunction( "requireMaxState", module.requireMaxState )
		.isFunction( "requireMinState", module.requireMinState )
		.isFunction( "log", module.log )
		.isFunction( "module", module.module )
		.isFunction( "trigger", module.trigger )
		.isFunction( "custom", module.custom )
		.isFunction( "option", module.option )
		.isFunction( "junit", module.junit )
		.isFunction( "close", module.close )
		.isFunction( "finish", module.finish );
});


// Root ok assertion for which each sub assertions calls
munit( 'assert.core.ok', function( assert ) {
	var module = MUNIT.Assert( "a.b.c" );

	// Can only run tests on modules that are in an active state
	module._pass = module._fail = munit.noop;
	module.state = MUNIT.ASSERT_STATE_DEFAULT;
	assert.throws( 'Already Closed', /'a.b.c' hasn't been triggered yet/, function(){
		module.ok( 'Test Closed' );
	});

	// Using a key that already exists should throw an error
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module.tests[ 'test exists' ] = {};
	assert.throws( 'Test Exists', /Duplicate Test 'test exists' on 'a.b.c'/, function(){
		module.ok( 'test exists' );
	});

	// Passed test
	module = MUNIT.Assert( "a.b.c" );
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._pass = function( name ) {
		assert.equal( '_pass', name, '_pass-test' );
	};
	module._fail = function( name ) {
		assert.fail( '_pass' );
	};
	module.ok( '_pass-test', true );

	// Failed test
	module = MUNIT.Assert( "a.b.c" );
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._pass = function( name ) {
		assert.fail( '_fail' );
	};
	module._fail = function( name, startFunc, extra ) {
		assert.equal( '_fail name', name, '_fail-test' );
		assert.equal( '_fail startFunc', startFunc, munit.noop );
		assert.equal( '_fail extra', extra, 'This test failed' );
	};
	module.ok( '_fail-test', false, munit.noop, 'This test failed' );

	// Failed test default startFunc
	module = MUNIT.Assert( "a.b.c" );
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._pass = function( name ) {
		assert.fail( '_fail startFunc default' );
	};
	module._fail = function( name, startFunc, extra ) {
		assert.equal( '_fail startFunc default', startFunc, module.ok );
	};
	module.ok( '_fail-startFunc', false );

	// Exceeding expect triggers closing of module
	module = MUNIT.Assert( "a.b.c" );
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._pass = module._fail = munit.noop;
	module.close = function(){
		assert.pass( 'expect close' );
	};
	module.count = 3;
	module.options = { expect: 4 };
	module.ok( 'trigger close', true );
	if ( ! assert.tests[ 'expect close' ] ) {
		assert.fail( 'expect close' );
	}

	// Count checking
	module = MUNIT.Assert( "a.b.c" );
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._pass = module._fail = munit.noop;
	assert.equal( 'Count - Initial', module.count, 0 );
	module.ok( 'Count 1' );
	assert.equal( 'Count - Incremented', module.count, 1 );
	module.ok( 'Count 2' );
	assert.equal( 'Count - Secondary Increment', module.count, 2 );
});


// Internal failed test registry
munit( 'assert.core._fail', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// First failed test
	MUNIT.failed = 0;
	module.options.stopOnFail = false;
	module._fail( 'failed test', munit.noop, "Custom Error Message" );

	// Check that all properties are correct after first failed test
	assert.equal( 'Munit failed count', MUNIT.failed, 1 );
	assert.equal( 'Module failed count', module.failed, 1 );
	assert.exists( 'test result', module.tests[ 'failed test' ] );
	assert.equal( 'test result stack', module.list[ 0 ], module.tests[ 'failed test' ] );
	assert.equal( 'test result message', module.tests[ 'failed test' ].error.message, "Custom Error Message\n" );

	// Do another test, without custom error message or start function
	module._fail( 'secondary' );
	assert.equal( 'Secondary Munit failed count', MUNIT.failed, 2 );
	assert.equal( 'Seconday Module failed count', module.failed, 2 );
	assert.exists( 'Secondary test result', module.tests.secondary );
	assert.equal( 'Secondary test result stack', module.list[ 1 ], module.tests.secondary );
	assert.equal( 'Secondary test result message', module.tests.secondary.error.message, "secondary test failed\n" );
});


// Internal passed test registry
munit( 'assert.core._pass', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// First passed test
	MUNIT.passed = 0;
	module._pass( 'passed test' );

	// Check that all properties are correct after first passed test
	assert.equal( 'Munit passed count', MUNIT.passed, 1 );
	assert.equal( 'Module passed count', module.passed, 1 );
	assert.exists( 'test result', module.tests[ 'passed test' ] );
	assert.equal( 'test result stack', module.list[ 0 ], module.tests[ 'passed test' ] );

	// Check secondary pass
	module._pass( 'secondary' );
	assert.equal( 'Secondary Munit passed count', MUNIT.passed, 2 );
	assert.equal( 'Seconday Module passed count', module.passed, 2 );
	assert.exists( 'Secondary test result', module.tests.secondary );
	assert.equal( 'Secondary test result stack', module.list[ 1 ], module.tests.secondary );
});


// Skipped tests
munit( 'assert.core.skip', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		mock = {},
		_skipped = MUNIT.skipped,
		_passed = MUNIT.passed,
		_failed = MUNIT.failed;

	// Require active state for skipped tests
	module.state = MUNIT.ASSERT_STATE_DEFAULT;
	assert.throws( 'throw on non active states', /'a.b.c' hasn't been triggered yet/, function(){
		module.skip();
	});
	module.state = MUNIT.ASSERT_STATE_ACTIVE;


	// Require a name
	assert.throws( 'throw with no name', /Skip name not provided on 'a.b.c'/, function(){
		module.skip();
	});

	// Require a reason
	assert.throws( 'throw with no reason', /Skip reason not provided on 'a.b.c'/, function(){
		module.skip( 'test' );
	});

	// Throw on dupes
	module.tests.dupe = {};
	assert.throws( 'throw on duplicate test', /Duplicate Test 'dupe' on 'a.b.c'/, function(){
		module.skip( 'dupe', 'dupe reason' );
	});

	// Successful skip
	module = MUNIT.Assert( 'a.b.c' ),
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	module._assertResult = function(){
		return mock;
	};
	MUNIT.skipped = MUNIT.passed = MUNIT.failed = 0;
	module.skip( 'skipped', 'this needs to be skipped' );

	// Check all expected results
	assert.equal( 'munit skipped', MUNIT.skipped, 1 );
	assert.equal( 'module skipped', module.skipped, 1 );
	assert.equal( 'module count', module.count, 1 );
	assert.equal( 'module tests match', module.tests.skipped, mock );
	assert.equal( 'module list length', module.list.length, 1 );
	assert.equal( 'module list match', module.list[ 0 ], mock );

	// Restore counts
	MUNIT.skipped = _skipped;
	MUNIT.passed = _passed;
	MUNIT.failed = _failed;
});


// Utility method for deep object matching (throws exact keys mismatch)
munit( 'assert.core._objectMatch', function( assert ) {
	var module = MUNIT.Assert();

	function TestObject(){
		this.a = true;
		this.b = false;
	}
	TestObject.prototype = {
		custom: function(){}
	};

	// Success
	[

		{
			name: "Basic Object",
			actual: { a: true },
			expected: { a: true }
		},

		{
			name: "Nested",
			actual: { a: true, b: [ 1, 2, 3 ] },
			expected: { a: true, b: [ 1, 2, 3 ] }
		},

		{
			name: "Basic Array",
			actual: [ null, undefined ],
			expected: [ null, undefined ]
		},

		{
			name: "Nested Array",
			actual: [ { a: true }, "string" ],
			expected: [ { a: true }, "string" ]
		},

		{
			name: "Class Matching",
			actual: [ new TestObject() ],
			expected: [ { a: true, b: false } ]
		}

	].forEach(function( test ) {
		assert.doesNotThrow( test.name, function(){
			module._objectMatch( test.actual, test.expected );
		});
	});

	// Failures
	[

		{
			name: "Fail Array Length",
			actual: [ 1, 2, 3, 4 ],
			expected: [ 1, 2, 3, 4, 5 ],
			message: "\nActual: actual.length = 4" +
				"\nExpected: expected.length = 5"
		},

		{
			name: "Fail Array Match",
			actual: [ 1, 2, 3, 4 ],
			expected: [ 1, 2, 8, 4 ],
			message: "\nActual: actual[2] = 3" +
				"\nExpected: expected[2] = 8"
		},

		{
			name: "Fail Object Length",
			actual: { a: true },
			expected: { a: true, b: true },
			message: "\nActual: actual.length = 1" +
				"\nExpected: expected.length = 2"
		},

		{
			name: "Fail Object Match",
			actual: { a: true },
			expected: { a: false },
			message: "\nActual: actual[a] = true" +
				"\nExpected: expected[a] = false"
		},

		{
			name: "Fail Type Match",
			actual: 10,
			expected: "10",
			message: "\nActual: actual = 10" +
				"\nExpected: expected = 10"
		},

		{
			name: "Fail Nested",
			actual: { a: true, b: [ 1, 2, 3, { c: 'd', e: { f: false } } ] },
			expected: { a: true, b: [ 1, 2, 3, { c: 'd', e: { f: true } } ] },
			message: "\nActual: actual[b][3][e][f] = false" +
				"\nExpected: expected[b][3][e][f] = true"
		}

	].forEach(function( test ) {
		try {
			module._objectMatch( test.actual, test.expected );
		}
		catch ( e ) {
			if ( munit.isError( e ) ) {
				throw e;
			}

			assert.equal( test.name, e, test.message);
		}
	});
});


// Logging against modules/keys
munit( 'assert.core.log', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// Check for internal properties quickly to catch testing errors
	assert.isArray( '_logs', module._logs);
	assert.isFunction( '_filterLogs', module._filterLogs );

	// Check for internal logs array quickly catch testing errors
	module.log( "message" );
	assert.deepEqual( '_logs match', module._logs, [ [ 'message' ] ] );


	// Filter log matching
	module = MUNIT.Assert( 'a.b.c' );
	module.tests = { message: {}, "other test": {} };
	module.log( "message", 1, 2, 3 );
	module.log( "This will be a global key", 1, 2, 3 );
	module.log( "other test", { a: true, b: false } );
	module.log( "Another Global Key", [ 1, 2, 3 ] );
	module.log( "other test", { a: true, b: { c: 'd' } } );
	assert.deepEqual( '_filterLogs match',  module._filterLogs(), {
		all: [
			[ "This will be a global key", 1, 2, 3 ],
			[ "Another Global Key", [ 1, 2, 3 ] ]
		],
		keys: {
			"message": [
				[ 1, 2, 3 ]
			],
			"other test": [
				[ { a: true, b: false } ],
				[ { a: true, b: { c: 'd' } } ]
			]
		}
	});

	// Log should throw an error when in a greater than active state
	module.state = MUNIT.ASSERT_STATE_CLOSED;
	assert.throws( "Logging disabled after active state", /'a.b.c' is closed/, function(){
		module.log( "Throw me" );
	});
});


// Create submodules of current module
munit( 'assert.core.module', function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' ),
		_module = MUNIT._module,
		Slice = Array.prototype.slice;

	// Submodule should throw an error when in a greater than active state
	module.state = MUNIT.ASSERT_STATE_TEARDOWN;
	assert.throws( "Submodules are disabled after active state", /'a.b.c' is in the teardown processs/, function(){
		module.log( "another submod" );
	});
	module.state = MUNIT.ASSERT_STATE_DEFAULT;

	// Test multiple passthrough options
	[

		{
			name: 'basic',
			args: [ 'submod' ],
			match: [ 'submod', undefined, undefined, 'a.b.c' ]
		},

		{
			name: 'options and callback',
			args: [ 'submod', { expect: 234 }, munit.noop ],
			match: [ 'submod', { expect: 234 }, munit.noop, 'a.b.c' ]
		},

		{
			name: 'object of submodules',
			args: [ { submod1: munit.noop, submod2: munit.noop } ],
			match: [ { submod1: munit.noop, submod2: munit.noop }, undefined, undefined, 'a.b.c' ]
		}

	].forEach(function( object ) {
		MUNIT._module = function(){
			assert.deepEqual( object.name, Slice.call( arguments ), object.match );
		};
		module.module.apply( module, object.args );

		// Check that the pass through function was triggered
		if ( ! assert.tests[ object.name ] ) {
			assert.fail( object.name );
		}
	});

	// Replace the original mod handle
	MUNIT._module = _module;
});


// Custom assertion addition
munit( 'assert.core.custom', { priority: munit.PRIORITY_LOWEST }, function( assert ) {
	var module = MUNIT.Assert( 'a.b.c' );

	// Blocking on reserved words
	assert.throws(
		'Block on reserved words',
		/'once' is a reserved name and cannot be added as a custom assertion test/,
		function(){
			module.custom( "once", munit.noop );
		}
	);

	// Basic Addition
	assert.empty( 'Initial check', module.assertCustom );
	module.custom( 'assertCustom', function(){});
	assert.isFunction( 'assertCustom module', module.assertCustom );
	assert.empty( 'assertCustom not global', MUNIT.Assert.prototype.assertCustom );

	// Throw when module is past the active state
	module.state = MUNIT.ASSERT_STATE_ACTIVE;
	assert.throws( 'Attempting custom on non-default module', /'a.b.c' is active/, function(){
		module.custom( 'abcdef', munit.noop );
	});
});


// Option changing
munit( 'assert.core.option', { priority: munit.PRIORITY_LOWEST }, function( assert ) {
	var module = MUNIT.Assert( 'a.b.c', null, { isAsync: true, expect: 10, timeout: 25, setup: null } );

	// Test initial set
	assert.equal( 'getter isAsync', module.option( 'isAsync' ), true );
	assert.equal( 'getter expect', module.option( 'expect' ), 10 );
	assert.equal( 'getter timeout', module.option( 'timeout' ), 25 );
	assert.equal( 'getter setup', module.option( 'setup' ), null );

	// Changing list of options
	assert.doesNotThrow( 'Changing Options in Default State', function(){
		module.option({ expect: 50, timeout: 100 });
	});
	assert.equal( 'change not to isAsync', module.option( 'isAsync' ), true );
	assert.equal( 'change expect', module.option( 'expect' ), 50 );
	assert.equal( 'change timeout', module.option( 'timeout' ), 100 );

	// Single option change
	assert.doesNotThrow( 'Changing Async Option', function(){
		module.option( 'isAsync', false );
	});
	assert.equal( 'change single option isAsync', module.option( 'isAsync' ), false );

	// Fail in non active state
	module.state = MUNIT.ASSERT_STATE_TEARDOWN;
	assert.throws( 'fail option in teardown process', /'a.b.c' is in the teardown processs/, function(){
		module.option( 'isAsync', true );
	});

	// Extra fail check when attemping to change setup option past setup state
	module.state = MUNIT.ASSERT_STATE_SETUP;
	assert.throws( 'fail setup option in setup state', /'a.b.c' is already past the setup phase, can't change the setup option/, function(){
		module.option( 'setup', munit.noop );
	});

	// Sanity check that setup option change doesn't fail in default state
	module.state = MUNIT.ASSERT_STATE_DEFAULT;
	assert.doesNotThrow( 'setup option change success in default state', function(){
		module.option( 'setup', munit.noop );
	});
	assert.equal( 'Setup option changed', module.option( 'setup' ), munit.noop );
});
