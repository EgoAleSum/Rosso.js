(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Rosso = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var isArray = _dereq_('isarray');

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that are always escaped.
  '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name:      i,
        delimiter: null,
        optional:  false,
        repeat:    false
      });
    }
  }

  return attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));
  return attachKeys(regexp, keys);
}

/**
 * Replace the specific tags with regexp strings.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @return {String}
 */
function replacePath (path, keys) {
  var index = 0;

  function replace (_, escaped, prefix, key, capture, group, suffix, escape) {
    if (escaped) {
      return escaped;
    }

    if (escape) {
      return '\\' + escape;
    }

    var repeat   = suffix === '+' || suffix === '*';
    var optional = suffix === '?' || suffix === '*';

    keys.push({
      name:      key || index++,
      delimiter: prefix || '/',
      optional:  optional,
      repeat:    repeat
    });

    prefix = prefix ? ('\\' + prefix) : '';
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  }

  return path.replace(PATH_REGEXP, replace);
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || [];

  if (!isArray(keys)) {
    options = keys;
    keys = [];
  } else if (!options) {
    options = {};
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options);
  }

  if (isArray(path)) {
    return arrayToRegexp(path, keys, options);
  }

  var strict = options.strict;
  var end = options.end !== false;
  var route = replacePath(path, keys);
  var endsWithSlash = path.charAt(path.length - 1) === '/';

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
}

},{"isarray":2}],2:[function(_dereq_,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],3:[function(_dereq_,module,exports){
/*!
 Rosso.js - minimal client-side JS framework
 (C) 2014 Alessandro Segala
 Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.
 License: MIT
*/

'use strict';

/**
 * Initialize a new `Context`
 * with the given `path`.
 *
 * @param {String} path
 */

function Context(path) {
	var i = path.indexOf('?')
	
	this.path = path
	this.querystring = (i !== -1)
		? path.slice(i + 1)
		: ''
	this.pathname = (i !== -1)
		? path.slice(0, i)
		: path
	
	this.params = []
	
	this.querystringParams = {}
	if(this.querystring) {
		var allKV = this.querystring.split('&')
		for(var e in allKV) {
			var parts = allKV[e].split('=').map(decodeURIComponent)
			this.querystringParams[parts[0]] = parts[1]
		}
	}
}

/**
 * Expose Context
 */

if(module) module.exports = Context

},{}],4:[function(_dereq_,module,exports){
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
var Route = _dereq_('./Route.js')
var Context = _dereq_('./Context.js')

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

},{"./Context.js":3,"./Route.js":5}],5:[function(_dereq_,module,exports){
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

var pathToRegexp = _dereq_('path-to-regexp')

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

},{"path-to-regexp":1}]},{},[4])(4)
});