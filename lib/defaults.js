var munit = global.munit;

munit.defaults = {

	settings: {

		// Number of expected tests (0 represents an unknown number, assumes synchornous)
		expect: 0,

		// Order priority of the test
		priority: munit.PRIORITY_DEFAULT,

		// Module dependencies
		depends: null,

		// Allowed time to wait for module to complete it's tests
		timeout: 0,

		// Forces process stopage when a test fails
		stopOnFail: false,

		// Auto add queue objects back onto the stack
		autoQueue: true,

		// Defines queue object to wait for before running (true for any object)
		queue: null,

		// General object for passing information into a test module
		data: null,

		// Test setup function, defaults to just triggering the callback
		setup: null,

		// Test teardown function, defaults to just triggering the callback
		teardown: null

	},

	argv: [

		{
			name: 'render',
			short: 'r',
			type: 'path',
			description: 'Defines path to render for testing',
			example: "'munit --render=/path/to/dir' or 'munit -r /path/to/dir'"
		},

		{
			name: 'results',
			short: 'o',
			type: 'path',
			description: 'Defines output directory for test results',
			example: "'munit --results=/path/to/dir' or 'munit -o /path/to/dir'"
		},

		{
			name: 'focus',
			short: 'f',
			type: 'csv',
			description: 'Defines a list of namespaces that should only be run',
			example: "'munit --focus=a.b.c' or 'munit -f a.b.c'"
		}

	]
};
