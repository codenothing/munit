munit( 'cli', function( assert ) {
	var CWD = process.cwd() + '/',
		spy = assert.spy( MUNIT, 'render' );

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
			name: "focus prefix",
			args: [ "--focus=a.b.c" ],
			match: {
				render: CWD,
				focus: [ 'a.b.c' ]
			}
		},

		{
			name: "focus shorthand",
			args: [ "-f", "a.b.c,a.b.d" ],
			match: {
				render: CWD,
				focus: [ 'a.b.c', 'a.b.d' ]
			}
		},

		{
			name: "Combined",
			args: [ "-p", "my_prefix", "/path/to/render", "--junit=/path/junit", "-f", "a.b.c,e.f.g" ],
			match: {
				render: "/path/to/render",
				junit: "/path/junit",
				'junit-prefix': 'my_prefix',
				focus: [
					'a.b.c',
					'e.f.g'
				]
			}
		}

	].forEach(function( object ) {
		MUNIT.cli( object.args );
		assert.deepEqual( object.name, spy.args, [ object.match ] );
	});
});
