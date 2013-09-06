# Usage

There are 2 ways to trigger a test suite: Through the Cli, or through `munit.render`.

### munit.render

Render is the JS trigger for running the munit test suite. Path is only required if no
tests have been added yet.

```
munit.render( [ path, ] options );
```

```js
munit.render( __dirname + '/test/' );
```


### munit cli

If installed globally (`npm install -g munit`) the munit script may be used to manually run
test suites.

```
$ munit /path/to/test
```


# munit Cli Options


### render

The path to render for the test suite. Can be either a file or a directory.

```
$ munit /path/to/test/dir
$ munit -r /path/to/test/dir
$ munit --render=/path/to/test/dir
```

```js
munit.render({
	render: __dirname + '/test/'
});
```


### focus

Namespace(s) to focus tests on. When defined, only tests that fall on those namespaces will be triggered. Can be an array of names, or a single name.

```
$ munit -f core.util
$ munit --focus=core.util
$ munit --focus=core.util,core.network
```

```js
munit.render({
	focus: 'core.util'
});
```


### results

Path to write out the test results.

```
$ munit -o /path/to/results
$ munit --results=/path/to/results
```

```js
munit.render({
	results: __dirname + '/test-results/'
});
```
