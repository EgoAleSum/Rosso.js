;(function(){
	'use strict';
	
	Rosso('/test(\\d+)', {
		view: function(ctx) {
			return 'Test route '+ctx.params[0]
		},
		init: function(ctx) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /test', ctx)
			document.title = 'Some test route'
			next()
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Destroy /test')
		}
	})
})();
