# Rosso.js
[![Dependency Status](https://david-dm.org/EgoAleSum/Rosso.js.svg?style=flat)](https://david-dm.org/EgoAleSum/Rosso.js)
[![devDependency Status](https://david-dm.org/EgoAleSum/Rosso.js/dev-status.svg?style=flat)](https://david-dm.org/EgoAleSum/Rosso.js#info=devDependencies)

Minimal client-side JS framework.

Inspired by server-side frameworks like Express, Rosso.js is the simplest tool to build single-page web applications.

## Features

- **Minimal footprint**: Code is less than 2kb minified and gzipped.
- **No external dependenices**: Rosso.js does not depend on any template system or on any library like jQuery. However, you can use any library you want in your code.
- **Simple by choice**: Start write code with Rosso.js in minutes.
- **Follows your style**: Rosso.js does not force any structure or mindset and thus allows you to write code the way you prefer.

Rosso.js works best with single-page web applications. It implements Express4-style routing and presents the required views for each page. Navigation between pages is supported thanks to hash changes.

## Browser support

Rosso.js works on any browser that supports the `hashchange` event in JavaScript:

- IE 8+
- Firefox 3.6+
- Chrome 5+
- Safari 5+
- Opera 10.6+

On mobile:

- iOS (Safari) 4.0+
- Android browser 2.2+
- BlackBerry OS 7 and 10+
- IE Mobile 10+

## Downloading Rosso.js

Download the file `Rosso.js` (or `Rosso.min.js` for the minified version) and include it into your project.

Alternatively, you can get Rosso.js from [bower](http://bower.io/) too:

    $ bower install rosso

## Getting started

Setting up Rosso.js is extremely easy:

1. Load `Rosso.js` in your HTML page.
2. Create a container for the views.
3. Initialize the framework by calling `Rosso({container: 'htmlElementId')`. Alternatively, you can pass any DOM node as container, for example: `Rosso({container: document.querySelect('#htmlElementId')})`.

A sample page is presented here:

```html
<!DOCTYPE html>
<html>
<head>
<title>Rosso.js web application</title>
<meta charset="utf-8" />
</head>

<body>
<div id="view-container"></div>
<script type="text/javascript" src="Rosso.js"></script>
<script type="text/javascript">
Rosso({container: 'view-container'})
</script>

</body>
</html>
```

It is recommended that Rosso.js be loaded before the end of the `</body>` tag. This is necessary for having the DOM ready when calling the init method (`Rosso()`).<br />
Alternatively, you can place the call to `Rosso()` anywhere in the page if you bind it to the DOM ready event (e.g. using `$(document).ready()` with jQuery or any other library).

## Create views

A good way (though not the unique, see below) to create views is to include them in your HTML page inside an element with a specific id.<br />
While any HTML element with an id assigned could be a container for a view (including a `<div>` with `display: none`), the recommended way is to wrap the HTML code for your view inside a `<script>` tag with type `text/rosso-view`. While not required, it is recommended that the id follow the `view/[name]` style.<br/>
Example:

```html
<script type="text/rosso-view" id="view/home">
<p>Content for the /home view</p>
</script>
```

## Define routes

To define a route, call:

```javascript
Rosso(path, args)
```

### path

`path` follows the same format used by Express 4. Some examples include:

```javascript
// For the / path (normally the first page)
Rosso('/', args)
// Matches requests to /list
Rosso('/list', args) 
// /list followed by an id (for example, matches /list/1, /list/302, etc)
Rosso('/list/:id', args)
```

Only one route is matched for each path, so - for those familiar with Express - you cannot register multiple objects with the same path.<br>
There is also a special "catch-all" route `*`. This one is particularly useful to create "404" pages, when called at the end.<br>
Examples:

```javascript
Rosso('/home', argsHome)
Rosso('/list', argsList)
// 404 page; this has to be called at the end
Rosso('*', argsNotFound)
```

You can create your own paths with regular expressions as well. See the [manual](https://github.com/pillarjs/path-to-regexp#usage) for Path-to-RegExp for more details.

### args

`args` is an object that can contain the following properties:

- `view` can either be:
    * a *string* with the id of the view in the HTML code (e.g. `view/home` in the example above)
    * a *function* that will be called; the returned value is a string that will be added to the content view's *innerHTML* (this is useful if you want to use your own template engine, for example).
- `init` is a *function* called right after the view has been added to the DOM. Use this function to set up your view, request contents from a remote server, set observers, etc.<br/>Hint: you can change the title of the HTML page in the `init` function by doing `document.title = "New title"`.<br/>Arguments:
    * `ctx`: a Context object containing the following properties:
        - `ctx.path`: the full path matched (e.g. `/list/el20?foo=bar`)
        - `ctx.pathname`: the path without the querystring (e.g. `/list/el20`)
        - `ctx.querystring`: the full querystring (e.g. `foo=bar`)
        - `ctx.params`: an array with matched params from the path (e.g. with route `/list/:id`, `['el20']`)
        - `ctx.querystringParams`: an object with the key-value pairs from the query string (e.g. `{foo: 'bar'}`)
    * `next`: a function to be called to perform the following callback for the route, if any (like in Express)
- `destroy` is a *function* called before the view is unloaded and replaced with a new one. Use this function to unregister observers and perform any other action.

None of the previous properties is required. You can also create your own properties to perform your logic. Indeed, each route's `args` object is a sort of module that contains all the logic for that specific page.

### Example

```javascript
Rosso('/', {
	view: '#view/home', // The id of the view to load
    init: function(ctx, next) {
        console.log('/home Context:', ctx)
        document.title = 'Home' // Set a title for the browser
        next() // Perform the next callback for the route (if any)
    },
    destroy: function() {
        // Unregister all callbacks, etc
    }
})
```

Complete examples can be found in the `examples` directory.

## Navigating

Rosso.js listens to changes in the hash of the URL (everything that follows the `#` character). To navigate to another route, simply create a link to a new hash in the same page. For example:

```html
<a href="#/page2">View /page2</a>
<a href="#/list/el20">View object with id "el20" in /list</a>
<a href="#/">Home</a>
```

You can also push/pop a new page programmatically:

```javascript
Rosso.push('/page/next') // Shows a new page
Rosso.pop() // Goes back
Rosso.replace('/page/other') // Replaces the current page without creating a new entry in the browser's history
```

Each change of the hash creates a new element in the browser's history stack. Clicking the "previous" and "next" buttons in the browser will interact with Rosso.js to change page.

## Other public methods

Other public methods exposed by Rosso.js:

**Rosso.getPath()**
Returns the current path (obtained from the location hash)

**Rosso.currentPage()**
Returns the args object for the current page. 

## Contributions and license

Code is released under MIT License.<br>
This project is based on [page.js](https://github.com/tj/page.js) by TJ Holowaychuk (MIT License).<br />
The minified version includes [Path-to-RegExp](https://github.com/pillarjs/path-to-regexp) by Blake Embrey (MIT License).

Please see [LICENSE.md](LICENSE.md) for license text.
