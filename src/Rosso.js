var Route = require('./Route.js')
var Context = require('./Context.js')

/**
 * Running flag.
 */

var running = false

var options = {
	container: ''
}

/**
 * Register `path` with callback `fn()`,
 * or route `path`, or `Rosso.init()`.
 *
 *		  Rosso(fn)
 *		  Rosso('*', fn)
 *		  Rosso('/user/:id', load)
 *		  Rosso('/user/' + user.id, { some: 'thing' })
 *		  Rosso('/user/' + user.id)
 *		  Rosso()
 *
 * @param {String|Object} path
 * @param {Object} args...
 */

function Rosso(path, args) {
	// <callback>
	if('function' == typeof path) {
		return Rosso('*', path)
	}

	// route <path> to <callback ...>
	if(typeof args == 'object') {
		var newRoute = new Route(path)
		Rosso.callbacks.push(newRoute.middleware(function(ctx, next) {
			Rosso.loadPage(args, ctx, next)
		}))
	}
	// show <path> with [state]
	else if(typeof path == 'string') {
		Rosso.show(path)
	}
	// init [options]
	else {
		Rosso.init(path)
	}
}

Rosso.setOption = function(name, value) {
	options[name] = value
}

Rosso.getOption = function(name) {
	return options[name]
}

/**
 * Callback functions.
 */

Rosso.callbacks = []

/**
 * Bind with the given `options`.
 *
 * Options:
 *
 *		  - `click` bind to click events [true]
 *		  - `popstate` bind to popstate [true]
 *		  - `dispatch` perform initial dispatch [true]
 *
 * @param {Object} options
 */

Rosso.init = function(opts) {
	for(var name in opts) {
		this.setOption(name, opts[name])
	}
	
	if(!running) {
		running = true
		window.addEventListener('hashchange', locationHashChanged, false)
		// Force the callback when page loads
		locationHashChanged()
	}
}

/**
 * Unbind hashchange event handler.
 *
 */

Rosso.deinit = function() {
	running = false
	window.removeEventListener('hashchange', locationHashChanged, false)
}

Rosso.getPath = function() {
	if(window.location.href.indexOf('#') > -1)
	{
		var parts = window.location.href.split('#')
		return parts[parts.length - 1]
	}
	return ''
}

/**
 * Show `path` with optional `state` object.
 *
 * @param {String} path
 * @param {Object} state
 * @return {Context}
 */

Rosso.show = function(path) {
	var i = 0
	if(!path) path = ''
	
	var ctx = new Context(path)
	function next() {
		var fn = Rosso.callbacks[i++]
		if(!fn) return
		fn(ctx, next)
	}

	next()
}

Rosso.loadPage = function(args, ctx, next) {
	console.log(args)
	
	if(args.view && options.container) {
		// View is a string with the id of an element
	    if(typeof args.view == 'string' && args.view[0] == '#') {
	    	console.log('View: ', args.view.substr(1))
	    	var contents = document.getElementById(args.view.substr(1)).innerHTML
	    	document.getElementById(options.container).innerHTML = contents
	    }
	    // Load a file
	    else if(typeof args.view == 'string') {
	    }
	    else if(typeof args.view == 'function') {
	    	var contents = args.view(ctx)
	    	document.getElementById(options.container).innerHTML = contents
	    }
	}
	
	if(args.init) {
	    args.init(ctx, next)
	}
	else {
		if(next) next()
	}
}

function locationHashChanged() {
	console.log('Hash changed: ', Rosso.getPath())
	Rosso.show(Rosso.getPath())
}

module.exports = Rosso
window.Rosso = Rosso
