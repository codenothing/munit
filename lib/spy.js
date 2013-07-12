var munit = global.munit,
	Slice = Array.prototype.slice;

// Spy creation
function Spy( assert, module, method, options ) {
	var original;

	// Spies can only be created with an assertion module
	if ( ! ( assert instanceof munit.Assert ) ) {
		throw new munit.AssertionError( "Spies require an assertion module", Spy );
	}
	// No wrap provided, just empty spy
	else if ( munit.isObject( module ) && method === undefined && options === undefined ) {
		options = module;
		module = undefined;
	}
	else {
		options = options || {};
	}

	// Spy replacement
	function spy(){
		var call = new SpyCall( Slice.call( arguments ) );
		spy.history.push( call );
		spy.args = call.args;
		spy.count++;
		spy.returnValue = spy.option( 'returnValue' );

		// Callback for when spy gets triggered
		if ( spy.options.onCall ) {
			spy.returnValue = spy.options.onCall.apply( spy._module || spy, call.args );
		}

		// Pass trigger through to the original function if allowed
		if ( spy.wrapped && spy.options.passthru ) {
			spy.returnValue = spy.original.apply( spy._module, call.args );

			if ( spy.options.hasOwnProperty( 'returnValue' ) ) {
				spy.returnValue = spy.option( 'returnValue' );
			}
		}

		// After trigger callback
		if ( spy.options.afterCall ) {
			spy.returnValue = spy.options.afterCall.apply( spy._module || spy, call.args );
		}

		return spy.returnValue;
	}

	// Overwrite defined method
	if ( module && munit.isString( method ) ) {
		original = module[ method ];
		module[ method ] = spy;
	}

	// info
	return munit.extend( spy, {

		// Meta
		_module: module,
		_method: method,
		original: original,
		wrapped: !!original,
		isSpy: true,
		assert: assert,
		count: 0,
		args: [],
		history: [],
		options: options,

		// Changing options
		option: function( name, value ) {
			// Passing a list of options to change
			if ( munit.isObject( name ) ) {
				munit.each( name, function( value, name ) {
					spy.option( name, value );
				});

				return spy;
			}
			// Requesting to get the value of an option
			else if ( value === undefined ) {
				return spy.options[ name ];
			}

			spy.options[ name ] = value;
			return spy;
		},

		// Restores the original method back
		restore: function(){
			if ( spy.wrapped ) {
				spy._module[ spy._method ] = spy.original;
				spy.wrapped = false;
			}
		}

	});
}

// Call History Object
function SpyCall( args ) {
	var self = this;

	if ( ! ( self instanceof SpyCall ) ) {
		return new SpyCall( args );
	}

	self.args = args;
	self.time = new Date();
}

munit.Spy = Spy;
munit.SpyCall = SpyCall;
