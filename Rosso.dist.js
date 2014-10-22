(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Alessandro/Desktop/Rosso.js/node_modules/path-to-regexp/index.js":[function(require,module,exports){
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
var attachKeys = function (re, keys) {
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
  if (keys && !Array.isArray(keys)) {
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
    var groups = path.source.match(/\((?!\?)/g) || [];

    // Map all the matches to their numeric keys and push into the keys.
    keys.push.apply(keys, groups.map(function (match, index) {
      return {
        name:      index,
        delimiter: null,
        optional:  false,
        repeat:    false
      };
    }));

    // Return the source back to the user.
    return attachKeys(path, keys);
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value) {
      return pathtoRegexp(value, keys, options).source;
    });

    // Generate a new regexp instance by joining all the parts together.
    return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);
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

},{}],"/Users/Alessandro/Desktop/Rosso.js/src/Context.js":[function(require,module,exports){
/*!
 Rosso.js - minimal client-side JS framework
 (C) 2014 Alessandro Segala
 Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.
 License: MIT
*/

'use strict';

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

module.exports = Context

},{}],"/Users/Alessandro/Desktop/Rosso.js/src/Rosso.js":[function(require,module,exports){
/*!
 Rosso.js - minimal client-side JS framework
 (C) 2014 Alessandro Segala
 Based on page.js, (C) 2012 TJ Holowaychuk <tj@vision-media.ca>.
 License: MIT
*/

'use strict';

var Route = require('./Route.js')
var Context = require('./Context.js')

/**
 * Running flag.
 */

var running = false

var options = {
	container: ''
}

var currentPage = false

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
	if(currentPage) {
		Rosso.unloadPage(currentPage)
		currentPage = false
	}
	
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

Rosso.push = function(path) {
	window.location.hash = "#"+path
}

Rosso.pop = function() {
	window.history.back()
}

Rosso.loadPage = function(args, ctx, next) {
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
		args.init(ctx, next)
	}
	else {
		if(next) next()
	}
}

Rosso.unloadPage = function(args) {
	if(args.deinit) {
		args.destroy()
	}
}

function locationHashChanged() {
	Rosso.show(Rosso.getPath())
}

module.exports = Rosso
window.Rosso = Rosso

},{"./Context.js":"/Users/Alessandro/Desktop/Rosso.js/src/Context.js","./Route.js":"/Users/Alessandro/Desktop/Rosso.js/src/Route.js"}],"/Users/Alessandro/Desktop/Rosso.js/src/Route.js":[function(require,module,exports){
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

var pathtoRegexp = require('path-to-regexp')

/**
 * Initialize `Route` with the given HTTP `path`,
 * and an array of `callbacks` and `options`.
 *
 * Options:
 *
 *		  - `sensitive`		enable case-sensitive routes
 *		  - `strict`				 enable strict matching for trailing slashes
 *
 * @param {String} path
 * @param {Object} options.
 */

function Route(path, options) {
	options = options || {}
	this.path = (path === '*') ? '(.*)' : path
	this.regexp = pathtoRegexp(this.path,
		this.keys = [],
		options.sensitive,
		options.strict)
}

/**
 * Return route middleware with
 * the given callback `fn()`.
 *
 * @param {Function} fn
 * @return {Function}
 */

Route.prototype.middleware = function(fn){
	var self = this
	return function(ctx, next) {
		if(self.match(ctx.path, ctx.params)) return fn(ctx, next)
		next()
	}
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

module.exports = Route

},{"path-to-regexp":"/Users/Alessandro/Desktop/Rosso.js/node_modules/path-to-regexp/index.js"}]},{},["/Users/Alessandro/Desktop/Rosso.js/src/Rosso.js"]);
