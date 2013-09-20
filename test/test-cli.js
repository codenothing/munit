munit( 'cli', function( assert ) {
	var CWD = process.cwd() + '/',
		spy = assert.spy( MUNIT, 'render' ),
		_munit = global.munit;

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
			name: "results",
			args: [ "--results=/path/results" ],
			match: {
				render: CWD,
				results: '/path/results'
			}
		},

		{
			name: "results shorthand",
			args: [ "-o", "/path/results" ],
			match: {
				render: CWD,
				results: '/path/results'
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
			args: [ "/path/to/render", "--results=/path/results", "-f", "a.b.c,e.f.g" ],
			match: {
				render: "/path/to/render",
				results: "/path/results",
				focus: [
					'a.b.c',
					'e.f.g'
				]
			}
		}

	].forEach(function( object ) {
		MUNIT.cli( object.args );
		global.munit = _munit;
		assert.deepEqual( object.name, spy.args, [ object.match ] );
	});
});
