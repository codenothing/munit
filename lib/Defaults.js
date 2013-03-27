MUnit.Defaults = {

	Settings: {

		// Number of expected tests (0 represents an unknown number, assumes synchornous)
		expect: 0,

		// Order priority of the test
		priority: MUnit.PRIORITY_DEFAULT,

		// Allowed time to wait for module to complete it's tests
		timeout: 3000,

		// Forces process stopage when a test fails
		stopOnFail: false,

		// Auto add queue objects back onto the stack
		autoQueue: true,

		// Defines queue object to wait for before running (true for any object)
		queue: null

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
			name: 'junit',
			short: 'j',
			type: 'path',
			description: 'Defines output directory for junit xml test results',
			example: "'munit --junit=/path/to/dir' or 'munit -j /path/to/dir'"
		}

	]
};
