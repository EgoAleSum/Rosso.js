/*!
 Rosso.js - minimal client-side JS framework
 (C) 2014 Alessandro Segala
 Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.
 License: MIT
*/

'use strict';

/**
* Module dependencies.
*/

var pathToRegexp = require('path-to-regexp')

/**
 * Initialize `Route` with the given HTTP `path`
 * and `options`.
 *
 * Options (see also https://github.com/pillarjs/path-to-regexp#usage ):
 *
 *		  - `sensitive`		enable case-sensitive routes [false]
 *		  - `strict`		enable strict matching for trailing slashes [false]
 *
 * @param {String} path
 * @param {Object} args
 * @param {Object} options
 */

function Route(path, args, options) {
	options = options || {}
	this.path = (path === '*') ? '(.*)' : path
	this.regexp = pathToRegexp(this.path,
		this.keys = [],
		options.sensitive,
		options.strict)
	this.args = args
}

/**
 * Return args for the current route.
 *
 * @return {Object}
 */

Route.prototype.getArgs = function() {
	return this.args ? this.args : {}
}

/**
 * Set args for the current route.
 *
 * @param {Object} args
 */
 
 Route.prototype.setArgs = function(args) {
	this.args = args
}

/**
 * Check if this route matches `path`, if so
 * populate `params`.
 *
 * @param {String} path
 * @param {Array} params
 * @return {Boolean}
 */

Route.prototype.match = function(path, params) {
	var keys = this.keys
	var qsIndex = path.indexOf('?')
	var pathname = (qsIndex !== -1)
		? path.slice(0, qsIndex)
		: path
	var m = this.regexp.exec(decodeURIComponent(pathname))
	
	if(!m) return false
	
	for(var i = 1, len = m.length; i < len; ++i) {
		var key = keys[i - 1]
		
		var val = (typeof m[i] == 'string')
			? decodeURIComponent(m[i])
			: m[i]
		
		if(key) {
			params[key.name] = undefined !== params[key.name]
				? params[key.name]
				: val
		}
		else {
			params.push(val)
		}
	}
	
	return true
}

/**
 * Expose Route
 */

module.exports = Route
