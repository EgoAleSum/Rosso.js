/*!
 Rosso.js - minimal client-side JS framework
 (C) 2014 Alessandro Segala
 Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.
 License: MIT
*/

'use strict';

/**
 * Require dependencies with browserify.
 */
var Route = require('./Route.js')
var Context = require('./Context.js')

/**
 * Running flag.
 */
var running = false

/**
 * Default options for Rosso.js.
 */
var options = {
	container: ''
}

/**
 * Hold the `args` object for the current page.
 */
var currentPage = false

/**
 * Register `path` with `args`,
 * or show page `path`, or `Rosso.init([options])`.
 *
 *		  Rosso('*', args)
 *		  Rosso('/user/:id', args)
 *		  Rosso('/list/')
 *		  Rosso()
 *		  Rosso(options)
 *
 * @param {String|Object} path
 * @param {Object} args...
 * @api public
 */

function Rosso(path, args) {
	// route <path> to <callback ...>
	if(typeof args == 'object') {
		var newRoute = new Route(path, args)
		Rosso.callbacks.push(newRoute)
	}
	// show <path>
	else if(typeof path == 'string') {
		Rosso.show(path)
	}
	// init with [options]
	else {
		Rosso.init(path)
	}
}

/**
 * Callback functions.
 */

Rosso.callbacks = []

/**
 * Set `value` for option `name`.
 *
 * @param {String} name
 * @param {String} value
 * @api public
 */
 
Rosso.setOption = function(name, value) {
	options[name] = value
}

/**
 * Return the value for option `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Rosso.getOption = function(name) {
	return options[name]
}

/**
 * Initialize Rosso.js listener with `opts`.
 *
 * Options:
 *
 *		  - `container` id of the container object where to display views, or empty to disable ['']
 *
 * @param {Object} opts
 * @api public
 */

Rosso.init = function(opts) {
	for(var name in opts) {
		this.setOption(name, opts[name])
	}
	
	if(!running) {
		running = true
		window.addEventListener('hashchange', locationHashChanged, false)
		// Force the callback when first init (normally at page load)
		locationHashChanged()
	}
}

/**
 * Unbind hashchange event handler.
 *
 * @api public
 */

Rosso.deinit = function() {
	running = false
	window.removeEventListener('hashchange', locationHashChanged, false)
}

/**
 * Push a new `path` into the history stack.
 *
 * @param {String} path
 * @api public
 */

Rosso.push = function(path) {
	// Remove starting # if present
	if(path.substr(0, 1) == '#') path = path.substr(1)
	
	window.location.hash = '#'+path
}

/**
 * Pop the history stack.
 *
 * @api public
 */

Rosso.pop = function() {
	window.history.back()
}

/**
 * Replaces the current page with `path` without modifying the history stack.
 *
 * @param {String} path
 * @api public
 */

Rosso.replace = function(path) {
	// Remove starting # if present
	if(path.substr(0, 1) == '#') path = path.substr(1)
	
	// For browsers supporting HTML5 History API, this code is preferred. The other code does not work on Chrome on iOS and other browsers
	if(window.history && history.replaceState) {
		history.replaceState(undefined, undefined, '#'+path)
		// Force an update (necessary when not using location.replace)
		locationHashChanged()
	}
	else {
		location.replace('#'+path)
	}
}

/**
 * Show `path`.
 *
 * @param {String} path
 * @return {Context}
 * @api private
 */

Rosso.show = function(path) {
	// Remove starting # if present
	if(path.substr(0, 1) == '#') path = path.substr(1)
	
	if(currentPage) {
		Rosso.unloadPage(currentPage)
		currentPage = false
	}
	
	if(!path) path = ''
	
	var ctx = new Context(path)
	for(var i = 0; i < Rosso.callbacks.length; i++) {
		var route = Rosso.callbacks[i]
		if(route.match(ctx.path, ctx.params)) {
			Rosso.loadPage(route.args, ctx)
			currentPage = route.args
		}
	}
	
	return ctx
}

/**
 * Get current path.
 *
 * @return {String}
 * @api private
 */

Rosso.getPath = function() {
	if(window.location.href.indexOf('#') > -1)
	{
		var parts = window.location.href.split('#')
		return parts[parts.length - 1]
	}
	return ''
}

/**
 * Load a page: initialize it and show the view.
 *
 * @param {Object} args
 * @param {Context} ctx
 * @param {Function} next
 * @api private
 */

Rosso.loadPage = function(args, ctx) {
	if(args.view && options.container) {
		var destinationEl = document.getElementById(options.container)
		
		// View is a string with the id of an element
		if(typeof args.view == 'string' && args.view[0] == '#') {
			var sourceEl = document.getElementById(args.view.substr(1))
			if(sourceEl && destinationEl) {
				var contents = sourceEl.innerHTML
				destinationEl.innerHTML = contents
			}
		}
		else if(typeof args.view == 'function') {
			var contents = args.view(ctx)
			if(destinationEl) {
				destinationEl.innerHTML = contents
			}
		}
	}
	
	if(args.init) {
		args.init(ctx)
	}
}

/**
 * Unload a page.
 *
 * @param {Object} page
 * @api private
 */

Rosso.unloadPage = function(page) {
	if(page.destroy) {
		page.destroy()
	}
}

/**
 * Handle hashchange events.
 */

function locationHashChanged() {
	Rosso.show(Rosso.getPath())
}


/**
 * Expose Rosso
 */
if(module) module.exports = Rosso
window.Rosso = Rosso
