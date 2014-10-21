;(function(){
	'use strict';
	
	Rosso('/test(\\d+)', {
		view: function(ctx) {
			return 'Test route '+ctx.params[0]
		},
		init: function(ctx, next) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /test', ctx, !!next)
			next()
		},
		deinit: function() {
			// Unregister all callbacks, etc
			console.log('Deinit /test')
		}
	})
})();
