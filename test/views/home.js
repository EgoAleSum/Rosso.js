;(function(){
	'use strict';
	
	Rosso('/', {
		view: '#view/home',
		init: function(ctx) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Init /home', ctx)
			document.title = 'Home'
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Destroy /home')
		},
		testmethod: function(sender) {
			console.log('testmethod caled by: '+sender.id)
		}
	})
	
	// This route is added after the previous one, so it should never appear
	Rosso('/', {
		view: function() {
			return 'should never appear'
		},
		init: function(ctx) {
			// Manipulate DOM, setup actions, register callbacks, etc
			console.log('Should never appear!', ctx)
			document.title = 'Home error'
		},
		destroy: function() {
			// Unregister all callbacks, etc
			console.log('Should never be destroyed')
		}
	})
})();
