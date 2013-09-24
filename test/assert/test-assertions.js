munit( 'assert.assertions', { priority: munit.PRIORITY_HIGH }, function( assert ) {
	var module = MUNIT.Assert(),
		okSpy = assert.spy( module, 'ok' );

	[

		{
			name: 'pass name',
			method: 'pass',
			args: [ "test-pass" ],
			match: [ "test-pass", true, module.pass ]
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
			match: [ "test-fail", false, module.fail, undefined ]
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
			match: [ "test-fail", false, module.fail, "This test failed because" ]
		},

		{
			name: 'isTrue base',
			method: 'isTrue',
			args: [ "test-name", true ],
			match: [ "test-name", true, module.isTrue ]
		},

		{
			name: 'isTrue invalid type',
			method: 'isTrue',
			args: [ "test-name", 1 ],
			match: [ "test-name", false, module.isTrue, "Value is not True" ]
		},

		{
			name: 'isTrue false',
			method: 'isTrue',
			args: [ "test-name", false ],
			match: [ "test-name", false, module.isTrue, "Value is not True" ]
		},

		{
			name: 'isFalse base',
			method: 'isFalse',
			args: [ "test-name", false ],
			match: [ "test-name", true, module.isFalse ]
		},

		{
			name: 'isFalse invalid type',
			method: 'isFalse',
			args: [ "test-name", 0 ],
			match: [ "test-name", false, module.isFalse, "Value is not False" ]
		},

		{
			name: 'isFalse false',
			method: 'isFalse',
			args: [ "test-name", true ],
			match: [ "test-name", false, module.isFalse, "Value is not False" ]
		},

		{
			name: 'isUndefined base',
			method: 'isUndefined',
			args: [ "test-name", undefined ],
			match: [ "test-name", true, module.isUndefined ]
		},

		{
			name: 'isUndefined false',
			method: 'isUndefined',
			args: [ "test-name",  null ],
			match: [ "test-name", false, module.isUndefined, "Value is not Undefined" ]
		},

		{
			name: 'isNull base',
			method: 'isNull',
			args: [ "test-name", null ],
			match: [ "test-name", true, module.isNull ]
		},

		{
			name: 'isNull false',
			method: 'isNull',
			args: [ "test-name",  undefined ],
			match: [ "test-name", false, module.isNull, "Value is not Null" ]
		},

		{
			name: 'isBoolean base',
			method: 'isBoolean',
			args: [ "test-name", true ],
			match: [ "test-name", true, module.isBoolean ]
		},

		{
			name: 'isBoolean false type',
			method: 'isBoolean',
			args: [ "test-name",  false ],
			match: [ "test-name", true, module.isBoolean ]
		},

		{
			name: 'isBoolean invalid type',
			method: 'isBoolean',
			args: [ "test-name",  0 ],
			match: [ "test-name", false, module.isBoolean, "Value is not a Boolean" ]
		},

		{
			name: 'isNumber base',
			method: 'isNumber',
			args: [ "test-name", 1 ],
			match: [ "test-name", true, module.isNumber ]
		},

		{
			name: 'isNumber false',
			method: 'isNumber',
			args: [ "test-name",  false ],
			match: [ "test-name", false, module.isNumber, "Value is not a Number" ]
		},

		{
			name: 'isString base',
			method: 'isString',
			args: [ "test-name", "check 12" ],
			match: [ "test-name", true, module.isString ]
		},

		{
			name: 'isString false',
			method: 'isString',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, module.isString, "Value is not a String" ]
		},

		{
			name: 'isFunction base',
			method: 'isFunction',
			args: [ "test-name", function(){} ],
			match: [ "test-name", true, module.isFunction ]
		},

		{
			name: 'isFunction false',
			method: 'isFunction',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, module.isFunction, "Value is not a Function" ]
		},

		{
			name: 'isArray base',
			method: 'isArray',
			args: [ "test-name", [ 1, 2, 3 ] ],
			match: [ "test-name", true, module.isArray ]
		},

		{
			name: 'isArray false',
			method: 'isArray',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, module.isArray, "Value is not an Array" ]
		},

		{
			name: 'isDate base',
			method: 'isDate',
			args: [ "test-name", new Date() ],
			match: [ "test-name", true, module.isDate ]
		},

		{
			name: 'isDate false',
			method: 'isDate',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, module.isDate, "Value is not a Date" ]
		},

		{
			name: 'isRegExp base',
			method: 'isRegExp',
			args: [ "test-name", /test123/ ],
			match: [ "test-name", true, module.isRegExp ]
		},

		{
			name: 'isRegExp false',
			method: 'isRegExp',
			args: [ "test-name",  { a: 'b' } ],
			match: [ "test-name", false, module.isRegExp, "Value is not a RegExp" ]
		},

		{
			name: 'isObject base',
			method: 'isObject',
			args: [ "test-name", { a: 'b' } ],
			match: [ "test-name", true, module.isObject ]
		},

		{
			name: 'isObject false',
			method: 'isObject',
			args: [ "test-name",  new Date() ],
			match: [ "test-name", false, module.isObject, "Value is not an Object" ]
		},

		{
			name: 'isError base',
			method: 'isError',
			args: [ "test-name", new Error( "test 123" ) ],
			match: [ "test-name", true, module.isError ]
		},

		{
			name: 'isError class match',
			method: 'isError',
			args: [ "test-name", new MUNIT.AssertionError( "test 123" ), MUNIT.AssertionError ],
			match: [ "test-name", true, module.isError ]
		},

		{
			name: 'isError false',
			method: 'isError',
			args: [ "test-name",  new Date() ],
			match: [ "test-name", false, module.isError, "Value is not an Error" ]
		},

		{
			name: 'isError class mismatch',
			method: 'isError',
			args: [ "test-name", new Error( "test 123" ), MUNIT.AssertionError ],
			match: [ "test-name", false, module.isError, "Value is not an error class of AssertionError" ]
		},

		{
			name: 'exists base',
			method: 'exists',
			args: [ "test-name", true ],
			match: [ "test-name", true, module.exists ]
		},

		{
			name: 'exists false',
			method: 'exists',
			args: [ "test-name", false ],
			match: [ "test-name", true, module.exists ]
		},

		{
			name: 'exists null',
			method: 'exists',
			args: [ "test-name", null ],
			match: [ "test-name", false, module.exists, "Value does not exist" ]
		},

		{
			name: 'exists undefined',
			method: 'exists',
			args: [ "test-name", undefined ],
			match: [ "test-name", false, module.exists, "Value does not exist" ]
		},

		{
			name: 'empty null',
			method: 'empty',
			args: [ "test-name", null ],
			match: [ "test-name", true, module.empty ]
		},

		{
			name: 'empty undefined',
			method: 'empty',
			args: [ "test-name", undefined ],
			match: [ "test-name", true, module.empty ]
		},

		{
			name: 'empty false',
			method: 'empty',
			args: [ "test-name", false ],
			match: [ "test-name", false, module.empty, "Value is not empty" ]
		},

		{
			name: 'equal base',
			method: 'equal',
			args: [ "test-name", 1, 1 ],
			match: [ "test-name", true, module.equal ]
		},

		{
			name: 'equal empty',
			method: 'equal',
			args: [ "test-name", null, null ],
			match: [ "test-name", true, module.equal ]
		},

		{
			name: 'equal type fail',
			method: 'equal',
			args: [ "test-name", 0, "0" ],
			match: [ "test-name", false, module.equal, "\nValues should match\nActual:0\nExpected:0" ]
		},

		{
			name: 'equal fail',
			method: 'equal',
			args: [ "test-name", 10, 9 ],
			match: [ "test-name", false, module.equal, "\nValues should match\nActual:10\nExpected:9" ]
		},

		{
			name: 'notEqual base',
			method: 'notEqual',
			args: [ "test-name", 1, 2 ],
			match: [ "test-name", true, module.notEqual ]
		},

		{
			name: 'notEqual empty',
			method: 'notEqual',
			args: [ "test-name", null, undefined ],
			match: [ "test-name", true, module.notEqual ]
		},

		{
			name: 'notEqual type',
			method: 'notEqual',
			args: [ "test-name", 10, "10" ],
			match: [ "test-name", true, module.notEqual ]
		},

		{
			name: 'notEqual fail',
			method: 'notEqual',
			args: [ "test-name", 5, 5 ],
			match: [ "test-name", false, module.notEqual, "\nValues should not match\nActual:5\nExpected:5" ]
		},

		{
			name: 'greaterThan base',
			method: 'greaterThan',
			args: [ "test-name", 10, 5 ],
			match: [ "test-name", true, module.greaterThan ]
		},

		{
			name: 'greaterThan fail',
			method: 'greaterThan',
			args: [ "test-name", 10, 15 ],
			match: [ "test-name", false, module.greaterThan, "\nUpper Value '10' is not greater than lower value '15'" ]
		},

		{
			name: 'greaterThan equal',
			method: 'greaterThan',
			args: [ "test-name", 10, 10 ],
			match: [ "test-name", false, module.greaterThan, "\nUpper Value '10' is not greater than lower value '10'" ]
		},

		{
			name: 'lessThan base',
			method: 'lessThan',
			args: [ "test-name", 5, 10 ],
			match: [ "test-name", true, module.lessThan ]
		},

		{
			name: 'lessThan fail',
			method: 'lessThan',
			args: [ "test-name", 15, 10 ],
			match: [ "test-name", false, module.lessThan, "\nLower Value '15' is not less than upper value '10'" ]
		},

		{
			name: 'lessThan equal',
			method: 'lessThan',
			args: [ "test-name", 10, 10 ],
			match: [ "test-name", false, module.lessThan, "\nLower Value '10' is not less than upper value '10'" ]
		},

		{
			name: 'between base',
			method: 'between',
			args: [ "test-name", 7, 5, 10 ],
			match: [ "test-name", true, module.between ]
		},

		{
			name: 'between over',
			method: 'between',
			args: [ "test-name", 11, 5, 10 ],
			match: [ "test-name", false, module.between, "\nValue '11' is not inbetween '5' and '10'" ]
		},

		{
			name: 'between under',
			method: 'between',
			args: [ "test-name", 4, 5, 10 ],
			match: [ "test-name", false, module.between, "\nValue '4' is not inbetween '5' and '10'" ]
		},

		{
			name: 'between upper equal',
			method: 'between',
			args: [ "test-name", 10, 5, 10 ],
			match: [ "test-name", false, module.between, "\nValue '10' is not inbetween '5' and '10'" ]
		},

		{
			name: 'between lower equal',
			method: 'between',
			args: [ "test-name", 5, 5, 10 ],
			match: [ "test-name", false, module.between, "\nValue '5' is not inbetween '5' and '10'" ]
		},

		{
			name: 'deepEqual base',
			method: 'deepEqual',
			args: [ "test-name", { a: true }, { a: true } ],
			match: [ "test-name", true, module.deepEqual ]
		},

		{
			name: 'deepEqual fail',
			method: 'deepEqual',
			args: [ "test-name", { a: true }, { a: false } ],
			match: [
				"test-name",
				false,
				module.deepEqual,
				"\nActual: actual[a] = true" +
				"\nExpected: expected[a] = false"
			]
		},

		{
			name: 'notDeepEqual base',
			method: 'notDeepEqual',
			args: [ "test-name", { a: true }, { a: false } ],
			match: [ "test-name", true, module.notDeepEqual ]
		},

		{
			name: 'notDeepEqual fail',
			method: 'notDeepEqual',
			args: [ "test-name", { a: true }, { a: true } ],
			match: [ "test-name", false, module.notDeepEqual, "Objects are not supposed to match" ]
		},

		{
			name: 'throws',
			method: 'throws',
			args: [ "test-name", function(){ throw 'test'; } ],
			match: [ "test-name", true, module.throws ]
		},

		{
			name: 'throws string match',
			method: 'throws',
			args: [ "test-name", 'test', function(){ throw 'test'; } ],
			match: [ "test-name", true, module.throws ]
		},

		{
			name: 'throws regex match',
			method: 'throws',
			args: [ "test-name", /test/, function(){ throw 'test'; } ],
			match: [ "test-name", true, module.throws ]
		},

		{
			name: 'throws string error match',
			method: 'throws',
			args: [ "test-name", 'test', function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", true, module.throws ]
		},

		{
			name: 'throws regex error match',
			method: 'throws',
			args: [ "test-name", /test/, function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", true, module.throws ]
		},

		{
			name: 'throws error instanceof check',
			method: 'throws',
			args: [ "test-name", Error, function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", true, module.throws ]
		},

		{
			name: 'throws regex match fail',
			method: 'throws',
			args: [ "test-name", /fail/, function(){ throw 'test'; } ],
			match: [ "test-name", false, module.throws, "Regex (/fail/) could not find match on:\ntest" ]
		},

		{
			name: 'throws string match fail',
			method: 'throws',
			args: [ "test-name", 'fail', function(){ throw 'test'; } ],
			match: [ "test-name", false, module.throws, "Thrown message doesn't match:\nActual: test\nExpected: fail" ]
		},

		{
			name: 'doesNotThrow',
			method: 'doesNotThrow',
			args: [ "test-name", function(){} ],
			match: [ "test-name", true, module.doesNotThrow ]
		},

		{
			name: 'doesNotThrow fail',
			method: 'doesNotThrow',
			args: [ "test-name", function(){ throw new Error( 'test' ); } ],
			match: [ "test-name", false, module.doesNotThrow, 'Block does throw error' ]
		},

		{
			name: 'dateEquals pass',
			method: 'dateEquals',
			args: [ "test-name", new Date( 1234 ), new Date( 1234 ) ],
			match: [ "test-name", true, module.dateEquals ]
		},

		{
			name: 'dateEquals fail',
			method: 'dateEquals',
			args: [ "test-name", new Date( 1234 ), new Date( 4321 ) ],
			match: [ "test-name", false, module.dateEquals, "Date '" + ( new Date( 1234 ) ) + "' does not match '" + ( new Date( 4321 ) ) + "'" ]
		},

		{
			name: 'dateEquals actual not date',
			method: 'dateEquals',
			args: [ "test-name", 1234, new Date( 4321 ) ],
			match: [ "test-name", false, module.dateEquals, "Actual value is not a Date object '1234'" ]
		},

		{
			name: 'dateEquals expected not date',
			method: 'dateEquals',
			args: [ "test-name", new Date( 4321 ), null ],
			match: [ "test-name", false, module.dateEquals, "Expected value is not a Date object 'null'" ]
		},

		{
			name: 'dateAfter pass',
			method: 'dateAfter',
			args: [ "test-name", new Date( 1234 ), new Date( 1230 ) ],
			match: [ "test-name", true, module.dateAfter ]
		},

		{
			name: 'dateAfter fail',
			method: 'dateAfter',
			args: [ "test-name", new Date( 1234 ), new Date( 4321 ) ],
			match: [ "test-name", false, module.dateAfter, "Date '" + ( new Date( 1234 ) ) + "' is not after '" + ( new Date( 4321 ) ) + "'" ]
		},

		{
			name: 'dateAfter actual not date',
			method: 'dateAfter',
			args: [ "test-name", 1234, new Date( 4321 ) ],
			match: [ "test-name", false, module.dateAfter, "Actual value is not a Date object '1234'" ]
		},

		{
			name: 'dateAfter expected not date',
			method: 'dateAfter',
			args: [ "test-name", new Date( 4321 ), null ],
			match: [ "test-name", false, module.dateAfter, "Lower value is not a Date object 'null'" ]
		},


	].forEach(function( object ) {
		module[ object.method ].apply( module, object.args );
		assert.deepEqual( object.name, okSpy.args.slice( 0, object.match[ 1 ] ? 3 : 4 ), object.match );
	});
});
