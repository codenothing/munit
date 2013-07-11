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

		if ( spy.options.oncall ) {
			spy.options.oncall.apply( spy._module || spy, call.args );
		}

		if ( spy.wrapped && spy.options.passthru ) {
			spy.original.apply( spy._module, call.args );
		}

		if ( spy.options.aftercall ) {
			spy.options.aftercall.apply( spy._module || spy, call.args );
		}
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
