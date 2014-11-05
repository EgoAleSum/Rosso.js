(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isArray = require('isarray');

/**
 * Expose `pathtoRegexp`.
 */
module.exports = pathtoRegexp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match already escaped characters that would otherwise incorrectly appear
  // in future matches. This allows the user to escape special characters that
  // shouldn't be transformed.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
  // Match regexp special characters that should always be escaped.
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
};

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathtoRegexp (path, keys, options) {
  if (!isArray(keys)) {
    options = keys;
    keys = null;
  }

  keys = keys || [];
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var flags = options.sensitive ? '' : 'i';
  var index = 0;

  if (path instanceof RegExp) {
    // Match all capturing groups of a regexp.
    var groups = path.source.match(/\((?!\?)/g);

    // Map all the matches to their numeric indexes and push into the keys.
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

    // Return the source back to the user.
    return attachKeys(path, keys);
  }

  // Map array parts into regexps and return their source. We also pass
  // the same keys and options instance into every generation to get
  // consistent matching groups before we join the sources together.
  if (isArray(path)) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathtoRegexp(path[i], keys, options).source);
    }
    // Generate a new regexp instance by joining all the parts together.
    return attachKeys(new RegExp('(?:' + parts.join('|') + ')', flags), keys);
  }

  // Alter the path string into a usable regexp.
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
    // Avoiding re-escaping escaped characters.
    if (escaped) {
      return escaped;
    }

    // Escape regexp special characters.
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

    // Escape the prefix character.
    prefix = prefix ? '\\' + prefix : '';

    // Match using the custom capturing group, or fallback to capturing
    // everything up to the next slash (or next period if the param was
    // prefixed with a period).
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');

    // Allow parameters to be repeated more than once.
    if (repeat) {
      capture = capture + '(?:' + prefix + capture + ')*';
    }

    // Allow a parameter to be optional.
    if (optional) {
      return '(?:' + prefix + '(' + capture + '))?';
    }

    // Basic parameter support.
    return prefix + '(' + capture + ')';
  });

  // Check whether the path ends in a slash as it alters some match behaviour.
  var endsWithSlash = path[path.length - 1] === '/';

  // In non-strict mode we allow an optional trailing slash in the match. If
  // the path to match already ended with a slash, we need to remove it for
  // consistency. The slash is only valid at the very end of a path match, not
  // anywhere in the middle. This is important for non-ending mode, otherwise
  // "/test/" will match "/test//route".
  if (!strict) {
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
  }

  // In non-ending mode, we need prompt the capturing groups to match as much
  // as possible by using a positive lookahead for the end or next path segment.
  if (!end) {
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';
  }

  return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
};

},{"isarray":2}],2:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
 * Contain all routes.
 */

Rosso.routes = []

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
	for(var i = 0; i < Rosso.routes.length; i++) {
		var route = Rosso.routes[i]
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

},{"./Context.js":3,"./Route.js":5}],5:[function(require,module,exports){
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

},{"path-to-regexp":1}]},{},[4]);
