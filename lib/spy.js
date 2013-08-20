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
	else if ( method === undefined && options === undefined ) {
		options = module;
		module = undefined;
	}

	// Passing a function as the options argument auto assigns to the onCall method
	if ( munit.isFunction( options ) ) {
		options = { onCall: options };
	}
	else {
		options = options || {};
	}

	// Spy replacement
	function spy(){
		var call = new SpyCall( this, Slice.call( arguments ) );
		spy.history.push( call );
		spy.scope = call.scope;
		spy.args = call.args;
		spy.count++;
		spy.returnValue = spy.option( 'returnValue' );

		// Callback for when spy gets triggered
		if ( spy.options.onCall ) {
			spy.returnValue = spy.options.onCall.apply( spy.scope, spy.args );
		}

		// Pass trigger through to the original function if allowed
		if ( spy.wrapped && spy.options.passthru ) {
			spy.returnValue = spy.original.apply( spy.scope, spy.args );

			if ( spy.options.hasOwnProperty( 'returnValue' ) ) {
				spy.returnValue = spy.option( 'returnValue' );
			}
		}

		// After trigger callback
		if ( spy.options.afterCall ) {
			spy.returnValue = spy.options.afterCall.apply( spy.scope, spy.args );
		}

		return spy.returnValue;
	}

	// Overwrite defined method
	if ( module && munit.isString( method ) ) {
		original = module[ method ];
		module[ method ] = spy;
	}

	// Attach useful shortcuts to spy object
	[ 'onCall', 'afterCall' ].forEach(function( name ) {
		spy[ name ] = function( value ) {
			return spy.option( name, value );
		};
	});

	// Info
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
		data: {},
		options: options,
		scope: null,

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

			return spy;
		},

		// Resets history and counters
		reset: function(){
			spy.history = [];
			spy.args = [];
			spy.count = 0;
			spy.scope = null;

			return spy;
		}

	});
}

// Call History Object
function SpyCall( scope, args ) {
	var self = this;

	if ( ! ( self instanceof SpyCall ) ) {
		return new SpyCall( args );
	}

	self.scope = scope;
	self.args = args;
	self.time = new Date();
}

munit.Spy = Spy;
munit.SpyCall = SpyCall;
