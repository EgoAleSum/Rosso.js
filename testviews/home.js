;(function(){
	'use strict';
	
	Rosso('/', {
		view: '#view/home',
		init: function(ctx, next) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /home', ctx, !!next)
			document.title = 'Home'
			next()
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Destroy /home')
		},
		testmethod: function(sender) {
			console.log('testmethod caled by: '+sender.id)
		}
	})
})();
