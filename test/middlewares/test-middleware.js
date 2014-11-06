;(function(){
	'use strict';
	
	function testfunc() {
		return 'test-middleware'
	}
	
	Rosso.middleware('test-middleware', {
		init: function(ctx, next) {
			console.log('Middleware name: '+testfunc(), ctx)
			next()
		}
	})
})();
