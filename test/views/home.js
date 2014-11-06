;(function(){
	'use strict';
	
	Rosso('/', {
		view: '#view/home',
		middlewares: ['test-middleware'],
		init: function(ctx, next) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /home', ctx)
			document.title = 'Home'
			next()
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Destroy /home')
		}
	})
	
	// This route is added after the previous one, so it should never appear
	Rosso('/', {
		view: function() {
			return 'should never appear'
		},
		init: function(ctx, next) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Should never appear!', ctx)
			document.title = 'Home error'
			next()
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Should never be destroyed')
		}
	})
})();
