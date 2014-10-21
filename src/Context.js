/*!
 Rosso.js - minimal client-side JS framework
 (C) 2014 Alessandro Segala
 Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.
 License: MIT
*/

/**
 * Initialize a new "request" `Context`
 * with the given `path` and optional initial `state`.
 *
 * @param {String} path
 * @param {Object} state
 */

function Context(path) {
	var i = path.indexOf('?')
	
	this.path = path
	this.title = document.title
	this.querystring = (i !== -1)
		? path.slice(i + 1)
		: ''
	this.pathname = (i !== -1)
		? path.slice(0, i)
		: path
	this.params = []
}

module.exports = Context
