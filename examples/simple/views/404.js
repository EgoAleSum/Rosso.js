// 404 error page
// IMPORTANT: this should be included last!
;(function(){
	'use strict';
	
	Rosso('*', {
		view: function(ctx) {
			return 'Not found: '+ctx.path
		},
		init: function(ctx, next) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /404', ctx)
			document.title = '404 Not found'
			
			next()
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Destroy /404')
		}
	})
})();
