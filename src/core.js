(function (global, undefined) {
    "use strict";
    
    // "import" the correct document
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
    
    // "export" game to the global variable
    global.game = game;
    
// get at whatever the global object is, like window in browsers
})((function(){return this}.call()));
