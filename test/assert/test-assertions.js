munit( 'assert.assertions', { priority: munit.PRIORITY_HIGH }, function( assert ) {
	var ASSERT = MUNIT.Assert();

	[

		{
			name: 'pass name',
			method: 'pass',
			args: [ "test-pass" ],
			match: [ "test-pass", true, ASSERT.pass ]
		},

		{
			name: 'pass function',
			method: 'pass',
			args: [ "test-pass", munit.noop ],
			match: [ "test-pass", true, munit.noop ]
		},

		{
			name: 'fail name',
			method: 'fail',
			args: [ "test-fail" ],
			match: [ "test-fail", false, ASSERT.fail, undefined ]
		},

		{
			name: 'fail function',
			method: 'fail',
			args: [ "test-fail", munit.noop ],
			match: [ "test-fail", false, munit.noop, undefined ]
		},

		{
			name: 'fail function extra',
			method: 'fail',
			args: [ "test-fail", munit.noop, "This test failed because" ],
			match: [ "test-fail", false, munit.noop, "This test failed because" ]
		},

		{
			name: 'fail extra',
			method: 'fail',
			args: [ "test-fail", "This test failed because" ],
			match: [ "test-fail", false, ASSERT.fail, "This test failed because" ]
		},

		{
			name: 'isTrue base',
			method: 'isTrue',
			args: [ "test-name", true ],
			match: [ "test-name", true, ASSERT.isTrue ]
		},

		{
			name: 'isTrue invalid type',
			method: 'isTrue',
			args: [ "test-name", 1 ],
			match: [ "test-name", false, ASSERT.isTrue, "Value is not True" ]
		},

		{
			name: 'isTrue false',
			method: 'isTrue',
			args: [ "test-name", false ],
			match: [ "test-name", false, ASSERT.isTrue, "Value is not True" ]
		},

		{
			name: 'isFalse base',
			method: 'isFalse',
			args: [ "test-name", false ],
			match: [ "test-name", true, ASSERT.isFalse ]
		},

		{
			name: 'isFalse invalid type',
			method: 'isFalse',
			args: [ "test-name", 0 ],
			match: [ "test-name", false, ASSERT.isFalse, "Value is not False" ]
		},

		{
			name: 'isFalse false',
			method: 'isFalse',
			args: [ "test-name", true ],
			match: [ "test-name", false, ASSERT.isFalse, "Value is not False" ]
		},

		{
			name: 'isUndefined base',
			method: 'isUndefined',
			args: [ "test-name", undefined ],
			match: [ "test-name", true, ASSERT.isUndefined ]
		},

		{
			name: 'isUndefined false',
			method: 'isUndefined',
			args: [ "test-name",  null ],
			match: [ "test-name", false, ASSERT.isUndefined, "Value is not Undefined" ]
		},

		{
			name: 'isNull base',
			method: 'isNull',
			args: [ "test-name", null ],
			match: [ "test-name", true, ASSERT.isNull ]
		},

		{
			name: 'isNull false',
			method: 'isNull',
			args: [ "test-name",  undefined ],
			match: [ "test-name", false, ASSERT.isNull, "Value is not Null" ]
		},

		{
			name: 'isBoolean base',
			method: 'isBoolean',
			args: [ "test-name", true ],
			match: [ "test-name", true, ASSERT.isBoolean ]
		},

		{
			name: 'isBoolean false type',
			method: 'isBoolean',
			args: [ "test-name",  false ],
			match: [ "test-name", true, ASSERT.isBoolean ]
		},

		{
			name: 'isBoolean invalid type',
			method: 'isBoolean',
			args: [ "test-name",  0 ],
			match: [ "test-name", false, ASSERT.isBoolean, "Value is not a Boolean" ]
		},

		{
			name: 'isNumber base',
			method: 'isNumber',
			args: [ "test-name", 1 ],
			match: [ "test-name", true, ASSERT.isNumber ]
		},

		{
			name: 'isNumber false',
			method: 'isNumber',
			args: [ "test-name",  false ],
			match: [ "test-name", false, ASSERT.isNumber, "Value is not a Number" ]
		},

		{
			name: 'isString base',
			method: 'isString',
			args: [ "test-name", "check 12" ],
			match: [ "test-name", true, ASSERT.isString ]
		},

		{
			name: 'isString false',
			method: 'isString',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, ASSERT.isString, "Value is not a String" ]
		},

		{
			name: 'isFunction base',
			method: 'isFunction',
			args: [ "test-name", function(){} ],
			match: [ "test-name", true, ASSERT.isFunction ]
		},

		{
			name: 'isFunction false',
			method: 'isFunction',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, ASSERT.isFunction, "Value is not a Function" ]
		},

		{
			name: 'isArray base',
			method: 'isArray',
			args: [ "test-name", [ 1, 2, 3 ] ],
			match: [ "test-name", true, ASSERT.isArray ]
		},

		{
			name: 'isArray false',
			method: 'isArray',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, ASSERT.isArray, "Value is not an Array" ]
		},

		{
			name: 'isDate base',
			method: 'isDate',
			args: [ "test-name", new Date() ],
			match: [ "test-name", true, ASSERT.isDate ]
		},

		{
			name: 'isDate false',
			method: 'isDate',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, ASSERT.isDate, "Value is not a Date" ]
		},

		{
			name: 'isRegExp base',
			method: 'isRegExp',
			args: [ "test-name", /test123/ ],
			match: [ "test-name", true, ASSERT.isRegExp ]
		},

		{
			name: 'isRegExp false',
			method: 'isRegExp',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, ASSERT.isRegExp, "Value is not a RegExp" ]
		},

		{
			name: 'isObject base',
			method: 'isObject',
			args: [ "test-name", { a: 'b' } ],
			match: [ "test-name", true, ASSERT.isObject ]
		},

		{
			name: 'isObject false',
			method: 'isObject',
			args: [ "test-name",  new Date() ],
			match: [ "test-name", false, ASSERT.isObject, "Value is not an Object" ]
		},

		{
			name: 'isError base',
			method: 'isError',
			args: [ "test-name", new Error( "test 123" ) ],
			match: [ "test-name", true, ASSERT.isError ]
		},

		{
			name: 'isError class match',
			method: 'isError',
			args: [ "test-name", new MUNIT.AssertionError( "test 123" ), MUNIT.AssertionError ],
			match: [ "test-name", true, ASSERT.isError ]
		},

		{
			name: 'isError false',
			method: 'isError',
			args: [ "test-name",  new Date() ],
			match: [ "test-name", false, ASSERT.isError, "Value is not an Error" ]
		},

		{
			name: 'isError class mismatch',
			method: 'isError',
			args: [ "test-name", new Error( "test 123" ), MUNIT.AssertionError ],
			match: [ "test-name", false, ASSERT.isError, "Value is not an error class of AssertionError" ]
		},

		{
			name: 'exists base',
			method: 'exists',
			args: [ "test-name", true ],
			match: [ "test-name", true, ASSERT.exists ]
		},

		{
			name: 'exists false',
			method: 'exists',
			args: [ "test-name", false ],
			match: [ "test-name", true, ASSERT.exists ]
		},

		{
			name: 'exists null',
			method: 'exists',
			args: [ "test-name", null ],
			match: [ "test-name", false, ASSERT.exists, "Value does not exist" ]
		},

		{
			name: 'exists undefined',
			method: 'exists',
			args: [ "test-name", undefined ],
			match: [ "test-name", false, ASSERT.exists, "Value does not exist" ]
		},

		{
			name: 'empty null',
			method: 'empty',
			args: [ "test-name", null ],
			match: [ "test-name", true, ASSERT.empty ]
		},

		{
			name: 'empty undefined',
			method: 'empty',
			args: [ "test-name", undefined ],
			match: [ "test-name", true, ASSERT.empty ]
		},

		{
			name: 'empty false',
			method: 'empty',
			args: [ "test-name", false ],
			match: [ "test-name", false, ASSERT.empty, "Value is not empty" ]
		},

		{
			name: 'equal base',
			method: 'equal',
			args: [ "test-name", 1, 1 ],
			match: [ "test-name", true, ASSERT.equal ]
		},

		{
			name: 'equal empty',
			method: 'equal',
			args: [ "test-name", null, null ],
			match: [ "test-name", true, ASSERT.equal ]
		},

		{
			name: 'equal type fail',
			method: 'equal',
			args: [ "test-name", 0, "0" ],
			match: [ "test-name", false, ASSERT.equal, "\nValues should match\nActual:0\nExpected:0" ]
		},

		{
			name: 'equal fail',
			method: 'equal',
			args: [ "test-name", 10, 9 ],
			match: [ "test-name", false, ASSERT.equal, "\nValues should match\nActual:10\nExpected:9" ]
		},

		{
			name: 'notEqual base',
			method: 'notEqual',
			args: [ "test-name", 1, 2 ],
			match: [ "test-name", true, ASSERT.notEqual ]
		},

		{
			name: 'notEqual empty',
			method: 'notEqual',
			args: [ "test-name", null, undefined ],
			match: [ "test-name", true, ASSERT.notEqual ]
		},

		{
			name: 'notEqual type',
			method: 'notEqual',
			args: [ "test-name", 10, "10" ],
			match: [ "test-name", true, ASSERT.notEqual ]
		},

		{
			name: 'notEqual fail',
			method: 'notEqual',
			args: [ "test-name", 5, 5 ],
			match: [ "test-name", false, ASSERT.notEqual, "\nValues should not match\nActual:5\nExpected:5" ]
		},

		{
			name: 'greaterThan base',
			method: 'greaterThan',
			args: [ "test-name", 10, 5 ],
			match: [ "test-name", true, ASSERT.greaterThan ]
		},

		{
			name: 'greaterThan fail',
			method: 'greaterThan',
			args: [ "test-name", 10, 15 ],
			match: [ "test-name", false, ASSERT.greaterThan, "\nUpper Value '10' is not greater than lower value '15'" ]
		},

		{
			name: 'greaterThan equal',
			method: 'greaterThan',
			args: [ "test-name", 10, 10 ],
			match: [ "test-name", false, ASSERT.greaterThan, "\nUpper Value '10' is not greater than lower value '10'" ]
		},

		{
			name: 'lessThan base',
			method: 'lessThan',
			args: [ "test-name", 5, 10 ],
			match: [ "test-name", true, ASSERT.lessThan ]
		},

		{
			name: 'lessThan fail',
			method: 'lessThan',
			args: [ "test-name", 15, 10 ],
			match: [ "test-name", false, ASSERT.lessThan, "\nLower Value '15' is not less than upper value '10'" ]
		},

		{
			name: 'lessThan equal',
			method: 'lessThan',
			args: [ "test-name", 10, 10 ],
			match: [ "test-name", false, ASSERT.lessThan, "\nLower Value '10' is not less than upper value '10'" ]
		},

		{
			name: 'deepEqual base',
			method: 'deepEqual',
			args: [ "test-name", { a: true }, { a: true } ],
			match: [ "test-name", true, ASSERT.deepEqual ]
		},

		{
			name: 'deepEqual fail',
			method: 'deepEqual',
			args: [ "test-name", { a: true }, { a: false } ],
			match: [
				"test-name",
				false,
				ASSERT.deepEqual,
				"\nActual: actual[a] = true" +
				"\nExpected: expected[a] = false"
			]
		},

		{
			name: 'notDeepEqual base',
			method: 'notDeepEqual',
			args: [ "test-name", { a: true }, { a: false } ],
			match: [ "test-name", true, ASSERT.notDeepEqual ]
		},

		{
			name: 'notDeepEqual fail',
			method: 'notDeepEqual',
			args: [ "test-name", { a: true }, { a: true } ],
			match: [ "test-name", false, ASSERT.notDeepEqual, "Objects are not supposed to match" ]
		},

		{
			name: 'throws',
			method: 'throws',
			args: [ "test-name", function(){ throw 'test'; } ],
			match: [ "test-name", true, ASSERT.throws ]
		},

		{
			name: 'throws string match',
			method: 'throws',
			args: [ "test-name", 'test', function(){ throw 'test'; } ],
			match: [ "test-name", true, ASSERT.throws ]
		},

		{
			name: 'throws regex match',
			method: 'throws',
			args: [ "test-name", /test/, function(){ throw 'test'; } ],
			match: [ "test-name", true, ASSERT.throws ]
		},

		{
			name: 'throws string error match',
			method: 'throws',
			args: [ "test-name", 'test', function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", true, ASSERT.throws ]
		},

		{
			name: 'throws regex error match',
			method: 'throws',
			args: [ "test-name", /test/, function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", true, ASSERT.throws ]
		},

		{
			name: 'throws error instanceof check',
			method: 'throws',
			args: [ "test-name", Error, function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", true, ASSERT.throws ]
		},

		{
			name: 'throws regex match fail',
			method: 'throws',
			args: [ "test-name", /fail/, function(){ throw 'test'; } ],
			match: [ "test-name", false, ASSERT.throws, "Regex (/fail/) could not find match on:\ntest" ]
		},

		{
			name: 'throws string match fail',
			method: 'throws',
			args: [ "test-name", 'fail', function(){ throw 'test'; } ],
			match: [ "test-name", false, ASSERT.throws, "Thrown message doesn't match:\nActual: test\nExpected: fail" ]
		},

		{
			name: 'doesNotThrow',
			method: 'doesNotThrow',
			args: [ "test-name", function(){} ],
			match: [ "test-name", true, ASSERT.doesNotThrow ]
		},

		{
			name: 'doesNotThrow fail',
			method: 'doesNotThrow',
			args: [ "test-name", function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", false, ASSERT.doesNotThrow, 'Block does throw error' ]
		}


	].forEach(function( object ) {
		ASSERT.ok = function( name, test, startFunc, extra ) {
			var actual = [ name, test, startFunc, extra ].slice( 0, test ? 3 : 4 );
			assert.deepEqual( object.name, actual, object.match );
		};
		ASSERT[ object.method ].apply( ASSERT, object.args );
	});
});
