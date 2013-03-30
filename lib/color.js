var munit = global.munit,
	Slice = Array.prototype.slice,
	colors = {
		'bold' : [1, 22],
		'italic' : [3, 23],
		'underline' : [4, 24],
		'inverse' : [7, 27],
		'white' : [37, 39],
		'gray' : [90, 39],
		'black' : [30, 39],
		'blue' : [34, 39],
		'cyan' : [36, 39],
		'green' : [32, 39],
		'magenta' : [35, 39],
		'red' : [31, 39],
		'yellow' : [33, 39]
	};

// Root logger
function color(){
	var args = Slice.call( arguments ), value, message;

	// The first argument belongs to the color code,
	if ( munit.isArray( args[ 0 ] ) ) {
		value = args.shift();
	}

	// Combine args into single message string
	// TODO: use inspection
	message = args.join( ' ' );

	// Print out colored log if passed
	if ( munit.isArray( value ) && process.stdout.isTTY ) {
		return "\033[" + value[ 0 ] + "m" + message + "\033[" + value[ 1 ] + "m";
	}
	else {
		return message;
	}
}


// Create shortcut functions for each color code
color.get = {};
munit.each( colors, function( value, name ) {
	color.get[ name ] = function(){
		var args = Slice.call( arguments );
		args.unshift( value );
		return color.apply( this, args );
	};

	color[ name ] = function(){
		console.log( color.get[ name ].apply( color.get, arguments ) );
	};
});

// Plain output
color.plain = color[ 'default' ] = function(){
	console.log.apply( console.log, Slice.call( arguments ) );
};


// Expose color
color.colors = colors;
munit.color = color;
