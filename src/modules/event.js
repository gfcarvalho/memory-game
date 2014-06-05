/**
 * -preserve MinPubSub
 * A micro publish/subscribe messaging framework
 * @author Copyright (c) 2011 Daniel Lamb <daniellmb.com>
 * @see https://github.com/daniellmb/MinPubSub
 * Licensed under the MIT license.
 */
(function (game, undefined) {

	/**
	 * Event Manager. 
	 * @namespace
	 * @memberOf game
	 */	
	game.events = (function () {				
		/** topic/subscription hash
		 * @private
		 */
		var cache = {};
		
		
		
		// ---------------------------------------------------------		
	    /**
		 * Publish some data on a named topic.
		 *	@name core.event#publish
		 *	@function
		 *	@public
		 *	@type void
		 *	@param topic
		 *			The channel to publish on
		 *	@param args (optional)
		 *			The data to publish. Each array item is converted into an ordered
		 *			arguments on the subscribed functions.
		 *	@example:
		 *	// Publish stuff on '/some/topic'. Anything subscribed will be called
		 *	// with a function signature like: function(a,b,c){ ... }
		 *	
		 *	game.event.publish("/some/topic", ["a","b","c"]);
		 */
		var publish = function(/** String */ topic, /** Array */ args) {
			var subs = cache[topic],
				len  = subs ? subs.length : 0;

			//can change loop or reverse array if the order matters
			while (len--) {
				subs[len].apply(this, args || []);
			}
		};

		/**
		 * Register a callback on a named topic.
		 *	@name core.event#subscribe
		 *	@function
		 *	@public
		 *	@param topic
		 *			The channel to subscribe to
		 *	@param callback
		 *			The handler event. Anytime something is publish'ed on a 
		 *			subscribed channel, the callback will be called with the
		 *			published array as ordered arguments. 
		 *  @return {Array}
		 * 			A handle which can be used to unsubscribe this particular subscription.
		 *	@example:
		 *	// register function(a, b, c) in "/some/topic" channel
		 *	
		 *	core.event.subscribe("/some/topic", function(a, b, c){ // handle data  });
		 */
		var subscribe = function (/** String */ topic, /** Function */ callback){
			if (!cache[topic]) {
				cache[topic] = [];
			}
			cache[topic].push(callback);
			return [topic, callback]; // Array
		};
		
		/**			
		 * Disconnect a subscribed function for a topic.
		 *	@name core.event#unsubscribe
		 *	@function
		 *	@public
		 *	@type void
		 *	@param topic
		 *			The channel to subscribe to
		 *	@param callback (optional)
		 *			The return value from a subscribe call.
		 *	@example:
		 *	var handle = subscribe("/some/topic", function(){});
		 *	unsubscribe(handle);
		 */
		var unsubscribe = function(/** Array */ handle, /** Function */ callback) {
			var subs     = cache[callback ? handle : handle[0]],
				callback = callback || handle[1],
				len      = subs ? subs.length : 0;
			
			while (len--) {
				if (subs[len] === callback) {
					subs.splice(len, 1);
				}
			}
		};
        
		return {
            dispatchEvent       : publish,
            addEventListener    : subscribe,
            removeEventListener : unsubscribe
        };
	})();

})((function(){return this}.call()).game);
