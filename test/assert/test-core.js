munit( 'assert', { priority: munit.PRIORITY_HIGHER } );

// Ensures all assertions exists
// THESE TESTS SHOULD NOT CHANGE WITHOUT HEAVY CONSIDERATION
munit( 'assert.core', function( assert ) {
	var parAssert = MUNIT.Assert( 'a.b' ),
		options = { expect: 10 },
		ASSERT = MUNIT.Assert( "a.b.c", parAssert, options, munit.noop );

	assert.equal( 'Namespace Path', ASSERT.nsPath, 'a.b.c' )
		.equal( 'Parent Assertion Module', ASSERT.parAssert, parAssert )
		.equal( 'options', ASSERT.options, options )
		.isArray( 'test list', ASSERT.list )
		.isObject( 'test hash', ASSERT.tests )
		.isObject( 'Sub namespace container', ASSERT.ns )
		.equal( 'test count', ASSERT.count, 0 )
		.equal( 'passed test count', ASSERT.passed, 0 )
		.equal( 'failed test count', ASSERT.failed, 0 )
		.equal( 'module callback', ASSERT.callback, munit.noop )
		.equal( 'module start time', ASSERT.start, 0 )
		.equal( 'module end time', ASSERT.end, 0 )
		.equal( 'async flag starts false', ASSERT.isAsync, false )
		.isFunction( "ok", ASSERT.ok )
		.isFunction( "pass", ASSERT.pass )
		.isFunction( "fail", ASSERT.fail )
		.isFunction( "isTrue", ASSERT.isTrue )
		.isFunction( "isFalse", ASSERT.isFalse )
		.isFunction( "isUndefined", ASSERT.isUndefined )
		.isFunction( "isNull", ASSERT.isNull )
		.isFunction( "isBoolean", ASSERT.isBoolean )
		.isFunction( "isNumber", ASSERT.isNumber )
		.isFunction( "isString", ASSERT.isString )
		.isFunction( "isFunction", ASSERT.isFunction )
		.isFunction( "isArray", ASSERT.isArray )
		.isFunction( "isDate", ASSERT.isDate )
		.isFunction( "isRegExp", ASSERT.isRegExp )
		.isFunction( "isObject", ASSERT.isObject )
		.isFunction( "isError", ASSERT.isError )
		.isFunction( "exists", ASSERT.exists )
		.isFunction( "empty", ASSERT.empty )
		.isFunction( "equal", ASSERT.equal )
		.isFunction( "notEqual", ASSERT.notEqual )
		.isFunction( "greaterThan", ASSERT.greaterThan )
		.isFunction( "lessThan", ASSERT.lessThan )
		.isFunction( "deepEqual", ASSERT.deepEqual )
		.isFunction( "notDeepEqual", ASSERT.notDeepEqual )
		.isFunction( "throws", ASSERT.throws )
		.isFunction( "doesNotThrow", ASSERT.doesNotThrow )
		.isFunction( "log", ASSERT.log )
		.isFunction( "module", ASSERT.module )
		.isFunction( "trigger", ASSERT.trigger )
		.isFunction( "custom", ASSERT.custom )
		.isFunction( "junit", ASSERT.junit )
		.isFunction( "close", ASSERT.close )
		.isFunction( "finish", ASSERT.finish );
});


// Root ok assertion for which each sub assertions calls
munit( 'assert.ok', function( assert ) {
	var ASSERT = MUNIT.Assert( "a.b.c" ), testran;

	// Modules that are closed should throw an error
	ASSERT._pass = ASSERT._fail = munit.noop;
	ASSERT._closed = true;
	assert.throws( 'Already Closed', /'a.b.c' already closed/, function(){
		ASSERT.ok( 'Test Closed' );
	});

	// Using a key that already exists should throw an error
	ASSERT._closed = false;
	ASSERT.tests[ 'test exists' ] = {};
	assert.throws( 'Test Exists', /Duplicate Test 'test exists' on 'a.b.c'/, function(){
		ASSERT.ok( 'test exists' );
	});

	// Passed test
	ASSERT = MUNIT.Assert( "a.b.c" );
	ASSERT._pass = function( name ) {
		assert.equal( '_pass', name, '_pass-test' );
	};
	ASSERT._fail = function( name ) {
		assert.fail( '_pass' );
	};
	ASSERT.ok( '_pass-test', true );

	// Failed test
	ASSERT = MUNIT.Assert( "a.b.c" );
	ASSERT._pass = function( name ) {
		assert.fail( '_fail' );
	};
	ASSERT._fail = function( name, startFunc, extra ) {
		assert.equal( '_fail name', name, '_fail-test' );
		assert.equal( '_fail startFunc', startFunc, munit.noop );
		assert.equal( '_fail extra', extra, 'This test failed' );
	};
	ASSERT.ok( '_fail-test', false, munit.noop, 'This test failed' );

	// Failed test default startFunc
	ASSERT = MUNIT.Assert( "a.b.c" );
	ASSERT._pass = function( name ) {
		assert.fail( '_fail startFunc default' );
	};
	ASSERT._fail = function( name, startFunc, extra ) {
		assert.equal( '_fail startFunc default', startFunc, ASSERT.ok );
	};
	ASSERT.ok( '_fail-startFunc', false );

	// Exceeding expect triggers closing of module
	ASSERT = MUNIT.Assert( "a.b.c" );
	ASSERT._pass = ASSERT._fail = munit.noop;
	ASSERT.close = function(){
		testran = true;
		assert.pass( 'expect close' );
	};
	testran = false;
	ASSERT.count = 3;
	ASSERT.options = { expect: 4 };
	ASSERT.ok( 'trigger close', true );
	if ( ! testran ) {
		assert.fail( 'expect close' );
	}

	// Count checking
	ASSERT = MUNIT.Assert( "a.b.c" );
	ASSERT._pass = ASSERT._fail = munit.noop;
	assert.equal( 'Count - Initial', ASSERT.count, 0 );
	ASSERT.ok( 'Count 1' );
	assert.equal( 'Count - Incremented', ASSERT.count, 1 );
	ASSERT.ok( 'Count 2' );
	assert.equal( 'Count - Secondary Increment', ASSERT.count, 2 );
});


// Utility method for deep object matching (throws exact keys mismatch)
munit( 'assert._objectMatch', function( assert ) {
	var ASSERT = MUNIT.Assert();

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
			ASSERT._objectMatch( test.actual, test.expected );
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
			ASSERT._objectMatch( test.actual, test.expected );
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
munit( 'assert.log', function( assert ) {
	var ASSERT = MUNIT.Assert( 'a.b.c' );

	// Check for internal properties quickly to catch testing errors
	assert.isArray( '_logs', ASSERT._logs);
	assert.isFunction( '_filterLogs', ASSERT._filterLogs );

	// Check for internal logs array quickly catch testing errors
	ASSERT.log( "message" );
	assert.deepEqual( '_logs match', ASSERT._logs, [ [ 'message' ] ] );


	// Filter log matching
	ASSERT = MUNIT.Assert( 'a.b.c' );
	ASSERT.tests = { message: {}, "other test": {} };
	ASSERT.log( "message", 1, 2, 3 );
	ASSERT.log( "This will be a global key", 1, 2, 3 );
	ASSERT.log( "other test", { a: true, b: false } );
	ASSERT.log( "Another Global Key", [ 1, 2, 3 ] );
	ASSERT.log( "other test", { a: true, b: { c: 'd' } } );
	assert.deepEqual( '_filterLogs match',  ASSERT._filterLogs(), {
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
});


// Sync trigger testing
munit( 'assert.trigger sync', function( assert ) {
	var ASSERT = MUNIT.Assert( 'a.b.c' );

	// Track method invoking
	ASSERT.callback = function( asrt ) {
		assert.equal( 'Single Argument', arguments.length, 1 );
		assert.equal( 'First Argument Assert', asrt, ASSERT );
		assert.ok( 'Start Time Set', asrt.start > 0 );
		assert.equal( 'End time should match start', asrt.start, asrt.end );
	};
	ASSERT.close = function(){
		assert.pass( 'Sync Trigger' );
	};
	ASSERT.trigger();
	assert.isFalse( 'Non Async', ASSERT.isAsync );

	// Close should be triggered (sync module)
	if ( ! assert.tests[ 'Sync Trigger' ] ) {
		assert.fail( 'Sync Trigger' );
	}


	// isAsync expect testing
	ASSERT = MUNIT.Assert( 'a.b.c', null, { expect: 10 } );
	ASSERT.close = ASSERT.callback = munit.noop;
	assert.isFalse( 'Expect only should be sync', ASSERT.isAsync );

	// isAsync timeout testing
	ASSERT = MUNIT.Assert( 'a.b.c', null, { timeout: 50 } );
	ASSERT.close = ASSERT.callback = munit.noop;
	assert.isFalse( 'Timeout only should be sync', ASSERT.isAsync );
});


// Async trigger tests
munit( 'assert.trigger async', 2, function( assert ) {
	var ASSERT = MUNIT.Assert( 'a.b.c', null, { expect: 1, timeout: 20 } ), afterTrigger = false;

	// Synchronous trigger
	ASSERT.callback = munit.noop;
	ASSERT.close = function(){
		assert.ok( 'Async Timeout Triggered', afterTrigger );
	};
	ASSERT.trigger();
	afterTrigger = true;
	assert.isTrue( 'Is Async', ASSERT.isAsync );

	// Fail out if close not triggered from timeout
	setTimeout(function(){
		if ( ! assert.tests[ 'Async Timeout Triggered' ] ) {
			assert.fail( 'Async Timeout Triggered' );
		}
	}, 25);
});


// Custom assertion addition
munit( 'assert.custom', { priority: munit.PRIORITY_LOWEST }, function( assert ) {
	var ASSERT = MUNIT.Assert( 'a.b.c' );

	// Blocking on reserved words
	assert.throws(
		'Block on reserved words',
		/'once' is a reserved name and cannot be added as a custom assertion test/,
		function(){
			ASSERT.custom( "once", munit.noop );
		}
	);

	// Basic Addition
	assert.empty( 'Initial check', ASSERT.assertCustom );
	ASSERT.custom( 'assertCustom', function(){});
	assert.isFunction( 'assertCustom ASSERT', ASSERT.assertCustom );
	assert.empty( 'assertCustom not global', MUNIT.Assert.prototype.assertCustom );
});


// Close tests
munit( 'assert.close', function( assert ) {
	var ASSERT = MUNIT.Assert( 'a.b.c' );

	assert.throws( 'Throws error when already closed', /a.b.c is already closed/, function(){
		ASSERT._closed = true;
		ASSERT.close();
	});
});


// Finish tests
munit( 'assert.finish', function( assert ) {
	var ASSERT = MUNIT.Assert( 'a.b.c' );

	assert.throws( 'Throws error when already closed', /a.b.c and it's submodules have already finished/, function(){
		ASSERT._finished = true;
		ASSERT.finish();
	});
});
