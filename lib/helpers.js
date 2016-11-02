/* globals  module */
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

var objectProto = Object.prototype;
var toString = objectProto.toString;

var arrayClass = '[object Array]';
var stringClass = '[object String]';
var helpers = {};

/**
 * @method isArray
 * @param {Any} value  The value to be tested for Array
 * @return {Boolean}
 * @private
 */
function isArray (value) {
    return (value && typeof value === 'object' && typeof value.length === 'number' &&
        toString.call(value) === arrayClass) || false;
}
/**
 * @method isString
 * @param {Any} value  The value to be tested for String
 * @return {Boolean}
 * @private
 */
function isString (value) {
    return typeof value === 'string' ||
        (value && typeof value === 'object' && toString.call(value) === stringClass) || false;
}

/**
 * @method isUndefined
 * @param {Any} value  The value to be tested for undefined
 * @return {Boolean}
 * @private
 */
function isUndefined(value) {
    return typeof value === 'undefined';
}

/**
 * @method isNull
 * @param {Any} value  The value to be tested for null
 * @return {Boolean}
 * @private
 */
function isNull(value) {
    return value === null;
}

/**
 * Returns true only for undefined or null
 * @method is_void
 * @param  {any}  value
 * @return {Boolean}
*/
function is_void (value) {
    return (isUndefined(value) || isNull(value));
}

helpers = {
    isArray: Array.isArray || isArray,
    isNull: isNull,
    isString: isString,
    isUndefined: isUndefined,
    is_void: is_void
};

module.exports = helpers;
