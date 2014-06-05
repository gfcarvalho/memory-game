(function (global, undefined) {
    "use strict";
    
    var document = global.document;
    var game;
    
    /** The game engine */
    game = {
            mod : "development",
            version : "@VERSION",                  
            
            // classes
            Board: undefined,
            Card: undefined,
            
            // modules
            system: undefined,
            events: undefined,
            dom: undefined,
            ui: undefined,
            utils: undefined,
                        
            debug: alertify.debug            
    };
    
    // AMD, CommonJS and window support
	if (typeof define === "function") {
		define([], function () { return game; });
	} else if (typeof module !== 'undefined' && module.exports) {
        module.exports = game;
    } else if (typeof global.game === "undefined") {
		global.game = game;
    }
    
// get at whatever the global object is, like window in browsers
})((function(){return this}.call()));
