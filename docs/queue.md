# Queue

Module queues allows tests to not run until resources are freed up for use.

```
munit.queue( name, key, callback );
munit.queue( name, [ options, ] callback );
```

```js
var http = require( 'http' ),
	server = http.createServer( munit.noop );

server.listen( 1337 );
munit.queue.add( server );

munit.queue( 'test-server', function( server, assert ) {
	// Run tests against server
});

munit.queue( 'more-test-server', function( server, assert ) {
	// Run tests against server, but wont run until 'test-server' is complete
});
```


### Multiple Limited Resources

For cases where there are multiple resources of different types, it's recomended to use the key'd approach
when dealing with queues. Just passing the string name of the key will work

```js
var http = require( 'http' ),
	portServer = http.createServer( munit.noop ),
	socketServer = http.createServer( munit.noop );

portServer.listen( 1337 );
munit.queue.add({ portServer: portServer });

socketServer.listen( 'unix://socket/path' );
munit.queue.add({ socketServer: socketServer });

munit.queue( 'test-port-server', 'portServer', function( queue, assert ) {
	var server = queue.portServer;
	// Run tests against port server
});

munit.queue( 'test-socket-server', 'socketServer', function( queue, assert ) {
	var server = queue.socketServer;
	// Run tests against socket server
});
```


### add

Adds object to be used as queue identifier

```
munit.queue.add( object );
```

```js
server = require( 'http' ).createServer( munit.noop );
server.listen( 1337 );
munit.queue.add( server );
```



### remove

Removes object from being used as queue identifier

```
munit.queue.add( object );
```

```js
server = require( 'http' ).createServer( munit.noop );
server.listen( 1337 );
munit.queue.add( server );
munit.queue.remove( server );
```
