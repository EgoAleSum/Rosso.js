;(function(){
	'use strict';
	
	Rosso('/redirect', {
		view: function(ctx) {
			return 'Redirect route'
		},
		init: function(ctx, next) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /redirect', ctx)
			document.title = 'Redirect'
			
			Rosso.replace('/test2')
			
			next()
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Destroy /redirect')
		}
	})
})();
