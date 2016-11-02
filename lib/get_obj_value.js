/* globals  module */
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

/**
 * Retrieves the sub value at the provided path,
 * from the value object provided.
 *
 * @method get_obj_value
 * @static
 * @param {Object} obj The object from which to extract the property value.
 * @param {Array|String} path  Array - A path array, specifying the object traversal path
 *                                    from which to obtain the sub value.<br>
 *                            String - A '.' delimited string specifying the object traversal path
 *                                     from which to obtain the sub value.
 * @param {String} defaultValue - The default value that should be returned if the value at the specified path or obj is undefined or null
 * @return {Any} The value stored in the path, defaultValue if either obj or value is not found.
 * if an empty path is provided.
 * @see http://yuilibrary.com/yui/docs/api/classes/Object.html#method_getValue
 */

var helpers = require('./helpers');
var isVoid = helpers.is_void;
var DOT = '.';

module.exports = function get_obj_value (obj, path, defaultValue) {
    if (!obj) {
        return defaultValue;
    }

    // Return obj if falsy path is specified, instead of throwing an Error
    if (!path) {
        return obj;
    }

    if (typeof path === 'string') {
        path = path.split(DOT);
    }

    for (var i = 0, l = path.length; obj && i < l; i++) {
        obj = obj[path[i]];
    }

    /*to make we return other falsy values like false, '', 0*/
    if (isVoid(obj)) {
        return defaultValue;
    } else {
        return obj;
    }
};
