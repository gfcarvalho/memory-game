(function (global, game, undefined) {

    var document = global.document;

    // replace to Modernizr

    var system = {
        
        touchSupported: ('createTouch' in document) || ('ontouchstart' in global) 
                        || (global.DocumentTouch && document instanceof DocumentTouch),
        
        localStorageSupported: (typeof global.localStorage !== "undefined"),
        
        canvasSupported: (function () {  
				var canvas = document.createElement('canvas');								
				return typeof canvas.getContext !== "undefined";				
        })(),
			
        audioSupported: (function () {  
            var audio = document.createElement('audio'); 
            return typeof audio.canPlayType !== "undefined";				
        })(),        
        
        rafSupported: (function () {
            var vendors = ['ms', 'moz', 'webkit', 'o'];            
            if (!global.requestAnimationFrame) {
                for (var x = 0; x < vendors.length; ++x) {						
                    if (global[vendors[x]+'RequestAnimationFrame']) {
                        return true;
                    }
                }
            } else {
                return true;
            }
            return false;
        })(),
        
        
        getTransitionEvent: function () {
			var t,
			    type,
			    supported   = false,
			    el          = document.createElement("fakeelement"),
			    transitions = {
				    "WebkitTransition" : "webkitTransitionEnd",
				    "MozTransition"    : "transitionend",
				    "OTransition"      : "otransitionend",
                    "transition"       : "transitionend"
			    };

			for (t in transitions) {
				if (el.style[t] !== undefined) {
					type      = transitions[t];
					supported = true;
					break;
				}
			}

			return {
				type      : type,
				supported : supported
			};
		}
        
    };
    
    game.system = system;    
	
})((function(){return this}.call()), (function(){return this}.call()).game);
