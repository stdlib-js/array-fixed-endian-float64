/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, no-restricted-syntax, no-invalid-this */

'use strict';

// MODULES //

var isNonNegativeInteger = require( '@stdlib/assert-is-nonnegative-integer' ).isPrimitive;
var isCollection = require( '@stdlib/assert-is-collection' );
var isArrayBuffer = require( '@stdlib/assert-is-arraybuffer' );
var isObject = require( '@stdlib/assert-is-object' );
var isFunction = require( '@stdlib/assert-is-function' );
var isString = require( '@stdlib/assert-is-string' ).isPrimitive;
var contains = require( '@stdlib/array-base-assert-contains' ).factory;
var lowercase = require( '@stdlib/string-base-lowercase' );
var hasIteratorSymbolSupport = require( '@stdlib/assert-has-iterator-symbol-support' );
var ITERATOR_SYMBOL = require( '@stdlib/symbol-iterator' );
var setReadOnly = require( '@stdlib/utils-define-nonenumerable-read-only-property' );
var isPrototypeOf = require( '@stdlib/assert-is-prototype-of' ); // eslint-disable-line stdlib/no-redeclare
var setReadOnlyAccessor = require( '@stdlib/utils-define-nonenumerable-read-only-accessor' );
var ArrayBuffer = require( '@stdlib/array-buffer' );
var DataView = require( '@stdlib/array-dataview' );
var getter = require( '@stdlib/array-base-getter' );
var accessorGetter = require( '@stdlib/array-base-accessor-getter' );
var format = require( '@stdlib/error-tools-fmtprodmsg' );
var fromIterator = require( './from_iterator.js' );
var fromIteratorMap = require( './from_iterator_map.js' );
var fromArray = require( './from_array.js' );


// VARIABLES //

var BYTES_PER_ELEMENT = 8; // 8 bytes per double
var HAS_ITERATOR_SYMBOL = hasIteratorSymbolSupport();
var isByteOrder = contains( [ 'little-endian', 'big-endian' ] );


// FUNCTIONS //

/**
* Normalizes a byte order value.
*
* @private
* @param {*} value - byte order
* @returns {(string|null)} normalized byte order
*/
function byteOrder( value ) {
	return ( isString( value ) ) ? lowercase( value ) : null;
}

/**
* Tests whether a provided byte order is little-endian byte order.
*
* @private
* @param {string} value - byte order
* @returns {boolean} boolean indicating whether a byte order is little-endian byte order
*/
function isLittleEndian( value ) {
	return ( value === 'little-endian' );
}

/**
* Returns a boolean indicating if a value is a `Float64ArrayFE` constructor.
*
* @private
* @param {*} value - value to test
* @returns {boolean} boolean indicating if a value is a `Float64ArrayFE` constructor
*/
function isFloat64ArrayFEConstructor( value ) { // eslint-disable-line id-length
	return ( value === Float64ArrayFE );
}

/**
* Returns a boolean indicating if a value is a `Float64ArrayFE`.
*
* @private
* @param {*} value - value to test
* @returns {boolean} boolean indicating if a value is a `Float64ArrayFE`
*/
function isFloat64ArrayFE( value ) {
	return (
		typeof value === 'object' &&
		value !== null &&
		(
			value.constructor.name === 'Float64ArrayFE' ||
			isPrototypeOf( value, Float64ArrayFE.prototype )
		) &&
		value.BYTES_PER_ELEMENT === BYTES_PER_ELEMENT
	);
}


// MAIN //

/**
* Typed array constructor which returns a typed array representing an array of double-precision floating-point numbers in a specified byte order.
*
* @constructor
* @param {string} endianness - byte order
* @param {(NonNegativeInteger|Collection|ArrayBuffer|Iterable)} [arg] - length, typed array, array-like object, buffer, or an iterable
* @param {NonNegativeInteger} [byteOffset=0] - byte offset
* @param {NonNegativeInteger} [length] - view length
* @throws {TypeError} first argument must be a supported byte order
* @throws {TypeError} if provided only two arguments, the second argument must be a valid argument
* @throws {TypeError} byte offset must be a nonnegative integer
* @throws {RangeError} must provide sufficient memory to accommodate byte offset and view length requirements
* @returns {Float64ArrayFE} typed array instance
*
* @example
* var arr = new Float64ArrayFE( 'little-endian' );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 0
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 2 );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 2
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', [ 1.0, 2.0 ] );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 2
*
* @example
* var ArrayBuffer = require( '@stdlib/array-buffer' );
*
* var buf = new ArrayBuffer( 16 );
* var arr = new Float64ArrayFE( 'little-endian', buf );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 2
*
* @example
* var ArrayBuffer = require( '@stdlib/array-buffer' );
*
* var buf = new ArrayBuffer( 16 );
* var arr = new Float64ArrayFE( 'little-endian', buf, 8 );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 1
*
* @example
* var ArrayBuffer = require( '@stdlib/array-buffer' );
*
* var buf = new ArrayBuffer( 32 );
* var arr = new Float64ArrayFE( 'little-endian', buf, 8, 2 );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 2
*/
function Float64ArrayFE() {
	var byteOffset;
	var endianness;
	var nargs;
	var isLE;
	var buf;
	var len;
	var arg;
	var tmp;

	nargs = arguments.length;
	if ( !(this instanceof Float64ArrayFE) ) {
		if ( nargs < 2 ) {
			return new Float64ArrayFE( arguments[0] );
		}
		if ( nargs === 2 ) {
			return new Float64ArrayFE( arguments[0], arguments[1] );
		}
		if ( nargs === 3 ) {
			return new Float64ArrayFE( arguments[0], arguments[1], arguments[2] );
		}
		return new Float64ArrayFE( arguments[0], arguments[1], arguments[2], arguments[3] );
	}
	endianness = byteOrder( arguments[ 0 ] );
	if ( endianness === null || !isByteOrder( endianness ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a supported byte order. Value: `%s`.', arguments[ 0 ] ) );
	}
	isLE = isLittleEndian( endianness );

	nargs -= 1;

	// Create the underlying data buffer...
	if ( nargs === 0 ) {
		buf = new DataView( new ArrayBuffer( 0 ) ); // backward-compatibility
	} else if ( nargs === 1 ) {
		arg = arguments[ nargs ];
		if ( isNonNegativeInteger( arg ) ) {
			buf = new DataView( new ArrayBuffer( arg*BYTES_PER_ELEMENT ) );
		} else if ( isCollection( arg ) ) {
			buf = fromArray( new DataView( new ArrayBuffer( arg.length*BYTES_PER_ELEMENT ) ), arg, isLE );
		} else if ( isArrayBuffer( arg ) ) {
			buf = new DataView( arg );
		} else if ( isObject( arg ) ) {
			if ( HAS_ITERATOR_SYMBOL === false ) {
				throw new TypeError( format( 'null29', arg ) );
			}
			if ( !isFunction( arg[ ITERATOR_SYMBOL ] ) ) {
				throw new TypeError( format( 'null2A', arg ) );
			}
			buf = arg[ ITERATOR_SYMBOL ]();
			if ( !isFunction( buf.next ) ) {
				throw new TypeError( format( 'null2A', arg ) );
			}
			tmp = fromIterator( buf );
			buf = fromArray( new DataView( new ArrayBuffer( tmp.length*BYTES_PER_ELEMENT ) ), tmp, isLE );
		} else {
			throw new TypeError( format( 'null2A', arg ) );
		}
	} else {
		buf = arguments[ 1 ];
		if ( !isArrayBuffer( buf ) ) {
			throw new TypeError( format( 'invalid argument. Must provide an ArrayBuffer. Value: `%s`.', buf ) );
		}
		byteOffset = arguments[ 2 ];
		if ( !isNonNegativeInteger( byteOffset ) ) {
			throw new TypeError( format( 'null2C', byteOffset ) );
		}
		if ( nargs === 2 ) {
			buf = new DataView( buf, byteOffset );
		} else {
			len = arguments[ 3 ];
			if ( !isNonNegativeInteger( len ) ) {
				throw new TypeError( format( 'null2F', len ) );
			}
			len *= BYTES_PER_ELEMENT;
			if ( len > (buf.byteLength-byteOffset) ) {
				throw new RangeError( format( 'null2G', len ) );
			}
			buf = new DataView( buf, byteOffset, len );
		}
	}
	setReadOnly( this, '_buffer', buf );
	setReadOnly( this, '_length', buf.byteLength/BYTES_PER_ELEMENT );
	setReadOnly( this, '_isLE', isLE );

	return this;
}

/**
* Size (in bytes) of each array element.
*
* @name BYTES_PER_ELEMENT
* @memberof Float64ArrayFE
* @readonly
* @type {PositiveInteger}
* @default 8
*
* @example
* var nbytes = Float64ArrayFE.BYTES_PER_ELEMENT;
* // returns 8
*/
setReadOnly( Float64ArrayFE, 'BYTES_PER_ELEMENT', BYTES_PER_ELEMENT );

/**
* Constructor name.
*
* @name name
* @memberof Float64ArrayFE
* @readonly
* @type {string}
* @default 'Float64ArrayFE'
*
* @example
* var str = Float64ArrayFE.name;
* // returns 'Float64ArrayFE'
*/
setReadOnly( Float64ArrayFE, 'name', 'Float64ArrayFE' );

/**
* Creates a new `Float64ArrayFE` from an array-like object or an iterable.
*
* @name from
* @memberof Float64ArrayFE
* @type {Function}
* @param {string} endianness - byte order
* @param {(Collection|Iterable)} src - array-like object or iterable
* @param {Function} [clbk] - callback to invoke for each source element
* @param {*} [thisArg] - context
* @throws {TypeError} `this` context must be a constructor
* @throws {TypeError} `this` must be a Float64ArrayFE
* @throws {TypeError} first argument must be a supported byte order
* @throws {TypeError} second argument must be an array-like object or an iterable
* @throws {TypeError} third argument must be a function
* @returns {Float64ArrayFE} typed array instance
*
* @example
* var arr = Float64ArrayFE.from( 'little-endian', [ 1.0, 2.0 ] );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 2
*
* @example
* function clbk( v ) {
*     return v * 2.0;
* }
*
* var arr = Float64ArrayFE.from( 'big-endian', [ 1.0, 2.0 ], clbk );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 2
*/
setReadOnly( Float64ArrayFE, 'from', function from( endianness, src ) {
	var thisArg;
	var order;
	var nargs;
	var clbk;
	var isLE;
	var out;
	var buf;
	var tmp;
	var get;
	var len;
	var i;
	if ( !isFunction( this ) ) {
		throw new TypeError( format('null01') );
	}
	if ( !isFloat64ArrayFEConstructor( this ) ) {
		throw new TypeError( 'invalid invocation. `this` is not a Float64ArrayFE.' );
	}
	order = byteOrder( endianness );
	if ( order === null || !isByteOrder( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a supported byte order. Value: `%s`.', endianness ) );
	}
	isLE = isLittleEndian( order );

	nargs = arguments.length;
	if ( nargs > 2 ) {
		clbk = arguments[ 2 ];
		if ( !isFunction( clbk ) ) {
			throw new TypeError( format( 'null3N', clbk ) );
		}
		if ( nargs > 3 ) {
			thisArg = arguments[ 3 ];
		}
	}
	if ( isCollection( src ) ) {
		if ( clbk ) {
			len = src.length;
			if ( src.get && src.set ) {
				get = accessorGetter( 'default' );
			} else {
				get = getter( 'default' );
			}
			out = new this( order, len );
			buf = out._buffer; // eslint-disable-line no-underscore-dangle
			for ( i = 0; i < len; i++ ) {
				buf.setFloat64( i*BYTES_PER_ELEMENT, clbk.call( thisArg, get( src, i ), i ), isLE );
			}
			return out;
		}
		return new this( order, src );
	}
	if ( isObject( src ) && HAS_ITERATOR_SYMBOL && isFunction( src[ ITERATOR_SYMBOL ] ) ) {
		buf = src[ ITERATOR_SYMBOL ]();
		if ( !isFunction( buf.next ) ) {
			throw new TypeError( format( 'nullAt', src ) );
		}
		if ( clbk ) {
			tmp = fromIteratorMap( buf, clbk, thisArg );
		} else {
			tmp = fromIterator( buf );
		}
		len = tmp.length;
		out = new this( order, len );
		buf = out._buffer; // eslint-disable-line no-underscore-dangle
		for ( i = 0; i < len; i++ ) {
			buf.setFloat64( i*BYTES_PER_ELEMENT, tmp[ i ], isLE );
		}
		return out;
	}
	throw new TypeError( format( 'nullAt', src ) );
});

/**
* Creates a new `Float64ArrayFE` from a variable number of arguments.
*
* @name of
* @memberof Float64ArrayFE
* @type {Function}
* @param {string} endianness - byte order
* @param {...*} element - array elements
* @throws {TypeError} `this` context must be a constructor
* @throws {TypeError} `this` must be a Float64ArrayFE
* @throws {TypeError} first argument must be a supported byte order
* @returns {Float64ArrayFE} typed array instance
*
* @example
* var arr = Float64ArrayFE.of( 'little-endian', 1.0, 1.0, 1.0, 1.0 );
* // returns <Float64ArrayFE>
*
* var len = arr.length;
* // returns 4
*/
setReadOnly( Float64ArrayFE, 'of', function of( endianness ) {
	var order;
	var args;
	var i;
	if ( !isFunction( this ) ) {
		throw new TypeError( format('null01') );
	}
	if ( !isFloat64ArrayFEConstructor( this ) ) {
		throw new TypeError( 'invalid invocation. `this` is not a Float64ArrayFE.' );
	}
	order = byteOrder( endianness );
	if ( order === null || !isByteOrder( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a supported byte order. Value: `%s`.', endianness ) );
	}
	args = [];
	for ( i = 1; i < arguments.length; i++ ) {
		args.push( arguments[ i ] );
	}
	return new this( order, args );
});

/**
* Pointer to the underlying data buffer.
*
* @name buffer
* @memberof Float64ArrayFE.prototype
* @readonly
* @type {ArrayBuffer}
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var buf = arr.buffer;
* // returns <ArrayBuffer>
*/
setReadOnlyAccessor( Float64ArrayFE.prototype, 'buffer', function get() {
	return this._buffer.buffer;
});

/**
* Size (in bytes) of the array.
*
* @name byteLength
* @memberof Float64ArrayFE.prototype
* @readonly
* @type {NonNegativeInteger}
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var byteLength = arr.byteLength;
* // returns 80
*/
setReadOnlyAccessor( Float64ArrayFE.prototype, 'byteLength', function get() {
	return this._buffer.byteLength;
});

/**
* Offset (in bytes) of the array from the start of its underlying `ArrayBuffer`.
*
* @name byteOffset
* @memberof Float64ArrayFE.prototype
* @readonly
* @type {NonNegativeInteger}
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var byteOffset = arr.byteOffset;
* // returns 0
*/
setReadOnlyAccessor( Float64ArrayFE.prototype, 'byteOffset', function get() {
	return this._buffer.byteOffset;
});

/**
* Size (in bytes) of each array element.
*
* @name BYTES_PER_ELEMENT
* @memberof Float64ArrayFE.prototype
* @readonly
* @type {PositiveInteger}
* @default 8
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var nbytes = arr.BYTES_PER_ELEMENT;
* // returns 8
*/
setReadOnly( Float64ArrayFE.prototype, 'BYTES_PER_ELEMENT', Float64ArrayFE.BYTES_PER_ELEMENT );

/**
* Returns an array element.
*
* @name get
* @memberof Float64ArrayFE.prototype
* @type {Function}
* @param {NonNegativeInteger} idx - element index
* @throws {TypeError} `this` must be a Float64ArrayFE
* @throws {TypeError} must provide a nonnegative integer
* @returns {(number|void)} array element
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var v = arr.get( 0 );
* // returns 0.0
*
* arr.set( [ 1.0, 2.0 ], 0 );
*
* v = arr.get( 0 );
* // returns 1.0
*
* v = arr.get( 100 );
* // returns undefined
*/
setReadOnly( Float64ArrayFE.prototype, 'get', function get( idx ) {
	if ( !isFloat64ArrayFE( this ) ) {
		throw new TypeError( 'invalid invocation. `this` is not a Float64ArrayFE.' );
	}
	if ( !isNonNegativeInteger( idx ) ) {
		throw new TypeError( format( 'null2K', idx ) );
	}
	if ( idx >= this._length ) {
		return;
	}
	return this._buffer.getFloat64( idx*BYTES_PER_ELEMENT, this._isLE );
});

/**
* Number of array elements.
*
* @name length
* @memberof Float64ArrayFE.prototype
* @readonly
* @type {NonNegativeInteger}
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var len = arr.length;
* // returns 10
*/
setReadOnlyAccessor( Float64ArrayFE.prototype, 'length', function get() {
	return this._length;
});

/**
* Sets an array element.
*
* ## Notes
*
* -   When provided a typed array, we must check whether the source array shares the same buffer as the target array and whether the underlying memory overlaps. In particular, we are concerned with the following scenario:
*
*     ```text
*     buf:                ---------------------
*     src: ---------------------
*     ```
*
*     In the above, as we copy values from `src`, we will overwrite values in the `src` view, resulting in duplicated values copied into the end of `buf`, which is not intended. Hence, to avoid overwriting source values, we must **copy** source values to a temporary array.
*
*     In the other overlapping scenario,
*
*     ```text
*     buf: ---------------------
*     src:                ---------------------
*     ```
*
*     by the time we begin copying into the overlapping region, we are copying from the end of `src`, a non-overlapping region, which means we don't run the risk of copying copied values, rather than the original `src` values, as intended.
*
* @name set
* @memberof Float64ArrayFE.prototype
* @type {Function}
* @param {(Collection|Float64ArrayFE|*)} value - value(s)
* @param {NonNegativeInteger} [i=0] - element index at which to start writing values
* @throws {TypeError} `this` must be a Float64ArrayFE
* @throws {TypeError} index argument must be a nonnegative integer
* @throws {RangeError} index argument is out-of-bounds
* @throws {RangeError} target array lacks sufficient storage to accommodate source values
* @returns {void}
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 10 );
*
* var v = arr.get( 0 );
* // returns 0.0
*
* arr.set( [ 1.0, 2.0 ], 0 );
*
* v = arr.get( 0 );
* // returns 1.0
*/
setReadOnly( Float64ArrayFE.prototype, 'set', function set( value ) {
	var sbuf;
	var idx;
	var buf;
	var tmp;
	var get;
	var N;
	var i;
	var j;
	if ( !isFloat64ArrayFE( this ) ) {
		throw new TypeError( 'invalid invocation. `this` is not a Float64ArrayFE.' );
	}
	buf = this._buffer;
	if ( arguments.length > 1 ) {
		idx = arguments[ 1 ];
		if ( !isNonNegativeInteger( idx ) ) {
			throw new TypeError( format( 'null2L', idx ) );
		}
	} else {
		idx = 0;
	}
	if ( isCollection( value ) ) {
		N = value.length;
		if ( idx+N > this._length ) {
			throw new RangeError( format('null03') );
		}
		sbuf = value;
		if ( sbuf.get && sbuf.set ) {
			get = accessorGetter( 'default' );
		} else {
			get = getter( 'default' );
		}
		// Check for overlapping memory...
		j = buf.byteOffset + (idx*BYTES_PER_ELEMENT);
		if (
			sbuf.buffer === buf.buffer &&
			(
				sbuf.byteOffset < j &&
				sbuf.byteOffset+sbuf.byteLength > j
			)
		) {
			// We need to copy source values...
			tmp = [];
			for ( i = 0; i < value.length; i++ ) {
				tmp.push( get( value, i ) );
			}
			sbuf = tmp;
			get = getter( 'default' );
		}
		for ( i = 0; i < N; idx++, i++ ) {
			buf.setFloat64( idx*BYTES_PER_ELEMENT, get( sbuf, i ), this._isLE );
		}
		return;
	}
	if ( idx >= this._length ) {
		throw new RangeError( format( 'null2M', idx ) );
	}
	buf.setFloat64( idx*BYTES_PER_ELEMENT, value, this._isLE );
});

/**
* Serializes an array as a string.
*
* @name toString
* @memberof Float64ArrayFE.prototype
* @type {Function}
* @throws {TypeError} `this` must be a Float64ArrayFE
* @returns {string} string representation
*
* @example
* var arr = new Float64ArrayFE( 'little-endian', 3 );
*
* arr.set( 1.0, 0 );
* arr.set( 2.0, 1 );
* arr.set( 3.0, 2 );
*
* var str = arr.toString();
* // returns '1,2,3'
*/
setReadOnly( Float64ArrayFE.prototype, 'toString', function toString() {
	var out;
	var buf;
	var i;
	if ( !isFloat64ArrayFE( this ) ) {
		throw new TypeError( 'invalid invocation. `this` is not a Float64ArrayFE.' );
	}
	out = [];
	buf = this._buffer;
	for ( i = 0; i < this._length; i++ ) {
		out.push( buf.getFloat64( i*BYTES_PER_ELEMENT, this._isLE ) );
	}
	return out.join( ',' );
});


// EXPORTS //

module.exports = Float64ArrayFE;