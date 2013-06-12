munit( 'cli', function( assert ) {
	var CWD = process.cwd() + '/';
	assert.isFunction( 'cli', MUNIT.cli );


	[

		{
			name: "No Arguments",
			args: [],
			match: {
				render: CWD
			}
		},

		{
			name: "Render Path",
			args: [ "/a/b/c/efg" ],
			match: {
				render: "/a/b/c/efg"
			}
		},

		{
			name: "Render",
			args: [ "--render=/path/render" ],
			match: {
				render: "/path/render"
			}
		},

		{
			name: "Render Shorthand",
			args: [ "-r", "/path/render" ],
			match: {
				render: "/path/render"
			}
		},

		{
			name: "junit",
			args: [ "--junit=/path/junit" ],
			match: {
				render: CWD,
				junit: '/path/junit'
			}
		},

		{
			name: "junit shorthand",
			args: [ "-j", "/path/junit" ],
			match: {
				render: CWD,
				junit: '/path/junit'
			}
		},

		{
			name: "junit prefix",
			args: [ "--junit-prefix=my_prefix" ],
			match: {
				render: CWD,
				'junit-prefix': 'my_prefix'
			}
		},

		{
			name: "junit prefix shorthand",
			args: [ "-p", "my_prefix" ],
			match: {
				render: CWD,
				'junit-prefix': 'my_prefix'
			}
		},

		{
			name: "Combined",
			args: [ "-p", "my_prefix", "/path/to/render", "--junit=/path/junit" ],
			match: {
				render: "/path/to/render",
				junit: "/path/junit",
				'junit-prefix': 'my_prefix'
			}
		}

	].forEach(function( object ) {
		var _render = MUNIT.render;

		// Duck punch for testing
		MUNIT.render = function( options ) {
			assert.deepEqual( object.name, options, object.match );
		};
		MUNIT.cli( object.args );

		// Reapply original render
		MUNIT.render = _render;
	});
});
