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
 * Hold the Route object for the current page.
 */
var currentPage = false

/**
 * Register `path` with `args`,
 * or show page `path`, or `Rosso.init([options])`.
 *
 *		  Rosso('/user/:id', args)
 *		  Rosso('/list/')
 *		  Rosso()
 *		  Rosso(options)
 *		  Rosso('*', args)
 *
 * @param {String|Object} path
 * @param {Object} args...
 * @api public
 */

function Rosso(path, args) {
	// route <path> to <args>
	if(typeof args == 'object') {
		var newRoute = new Route(path, args)
		Rosso.routes.push(newRoute)
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
 * Contain all routes and middlewares.
 */

Rosso.routes = []
Rosso.middlewares = {}

/**
 * Register a middleware.
 *
 * @param {String} name
 * @param {Object} args
 * @api public
 */

Rosso.middleware = function(name, args) {
	Rosso.middlewares[name] = args
}

/**
 * Set `value` for option `name`.
 *
 * @param {String} name
 * @param {Mixed} value
 * @api public
 */
 
Rosso.setOption = function(name, value) {
	options[name] = value
}

/**
 * Return the value for option `name`.
 *
 * @param {String} name
 * @return {Mixed}
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
	if(!running) return
	
	// Remove starting # if present
	if(path.substr(0, 1) == '#') path = path.substr(1)
	
	// Execute this code when the current call stack is complete. This is necessary because a route may call a push/pop/replace inside the init method
	setTimeout(function() {
		window.location.hash = '#'+path
	}, 0)
}

/**
 * Pop the history stack.
 *
 * @api public
 */

Rosso.pop = function() {
	if(!running) return
	
	// Execute this code when the current call stack is complete. This is necessary because a route may call a push/pop/replace inside the init method
	setTimeout(function() {
		window.history.back()
	}, 0)
}

/**
 * Replaces the current page with `path` without modifying the history stack.
 *
 * @param {String} path
 * @api public
 */

Rosso.replace = function(path) {
	if(!running) return
	
	// Remove starting # if present
	if(path.substr(0, 1) == '#') path = path.substr(1)
	
	// Execute this code when the current call stack is complete. This is necessary because a route may call a push/pop/replace inside the init method
	setTimeout(function() {
		// For browsers supporting HTML5 History API, this code is preferred. The other code does not work on Chrome on iOS and other browsers
		if(window.history && history.replaceState) {
			history.replaceState(undefined, undefined, '#'+path)
			// Force an update (necessary when not using location.replace)
			locationHashChanged()
		}
		else {
			location.replace('#'+path)
		}
	}, 0)
}

/**
 * Get current path.
 *
 * @return {String}
 * @api public
 */

Rosso.getPath = function() {
	if(window.location.href.indexOf('#') > -1) {
		var parts = window.location.href.split('#')
		return parts[parts.length - 1]
	}
	return ''
}

/**
 * Return current page args.
 *
 * @return {Object}
 * @api public
 */

Rosso.currentPage = function() {
	return currentPage.args
}

/*
 * Private methods
 */

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
	for(var i = 0; i < Rosso.routes.length; i++) {
		var route = Rosso.routes[i]
		if(route.match(ctx.path, ctx.params)) {
			currentPage = route
			Rosso.loadPage(route.args, ctx)
			break
		}
	}
	
	return ctx
}

/**
 * Load a page: initialize it and show the view.
 *
 * @param {Object} args
 * @param {Context} ctx
 * @param {Function} done(error)
 * @api private
 */

Rosso.loadPage = function(args, ctx, done) {
	// Using slice to copy the array without referencing it
	var callbacks = args.middlewares ? args.middlewares.slice() : []
	
	var initPage = function(ctx, next) {
		// Store the ctx object in the args
		args.ctx = ctx
		
		// Load the corresponding view
		if(args.view && options.container) {
			var destinationEl = false
			// Check if options.container is a DOM node or a string (the ID of a DOM node)
			if(typeof options.container === 'object' && options.container.nodeName) {
				destinationEl = options.container
			}
			else if(typeof options.container === 'string') {
				destinationEl = document.getElementById(options.container)
			}
			
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
		
		// Init the page
		if(args.init) {
			args.init(ctx, next)
		}
		else {
			next()
		}
	}
	callbacks.push(initPage)
		
	var errorCb = function(ctx, next) {
		next(true)
	}
	
	// next(error): the callback to continue with the following middleware. Pass any value that casts to true to interrput the cycle
	var next = function(error) {
		if(error) {
			if(done) done(true)
			return
		}
		
		var cb = callbacks.shift()
		if(cb) {
			// Load middleware with name 'cb'
			if(typeof cb == 'string') {
				cb = Rosso.middlewares[cb] ? Rosso.middlewares[cb].init : false
				if(!cb) {
					cb = errorCb
				}
			}
			cb(ctx, next)
		}
		else {
			if(done) done(false)
			return
		}
	}
	next()
	
	return true
}

/**
 * Unload a page.
 *
 * @param {Route} page
 * @api private
 */

Rosso.unloadPage = function(page) {
	if(page.args.ctx) {
		delete page.args.ctx
	}
	
	if(page.args.destroy) {
		page.args.destroy()
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
