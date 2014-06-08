(function (global, undefined) {
    "use strict";
    
    // "imports"
    var document = global.document;
    var game = global.game;
    
    // User interface helpers
    var ui = {
        fullScreen: false,
        
        toggleFullScreen: function () {
            var el = document.documentElement; 
            var rfs = el.requestFullScreen
                    || el.webkitRequestFullScreen
                    || el.mozRequestFullScreen
                    || el.oRequestFullScreen
                    || el.msRequestFullScreen;
            if(!this.fullscreen){			
                rfs.call(el);
                this.fullscreen = true;
            }
            else {            
                document.webkitCancelFullScreen();
                this.fullscreen = false;
            }
        },        
           
        reset: function () {
            alertify.set({
                labels : {
                    ok     : "OK",
                    cancel : "Cancel"
                },
                delay : 2200,
                buttonReverse : false,
                buttonFocus   : "ok"
            });
        },
    
        log: function(msg, delay) {
            this.reset();
            alertify.set({ delay: delay || 2200 });
            alertify.log(msg);
        },
        
        alert: function(msg, fn, delay) {
            this.reset();
            alertify.set({ delay: delay || 2200 });
            alertify.alert(msg, fn);
        }
    };
    
    // DOM manipulation helpers    
    var dom = {
        /** 
         * Clean up the game table 
         */
        removeChilds: function (node) {
            var last;
            while (last = node.lastChild) node.removeChild(last);
        }    
    };
    
    // Javascript helpers    
    var utils = {
        /** 
         * Shuffles an array
         */
        shuffle: function (array) {
          var counter = array.length, temp, index;

          // While there are elements in the array
          while (counter--) {
              // Pick a random index
              index = (Math.random() * (counter+1)) | 0;

              // And swap the last element with it
              temp = array[counter];
              array[counter] = array[index];
              array[index] = temp;
          }

          return array;
        },
        /** 
         * Removes one or more items from a position on an array
         * @param array the specific array
         * @param from the index of the item to be deleted
         * @param qtd the quantity of items to be deleted
         *
         */
        remove: function(array, from, qtd) {
            var q = 1;
            if(typeof qtd !== "undefined") {
                q = qtd;
            }
            array.splice(from, q);
        },
        /** 
         * Removes a specific object (if it exists) from an array
         *
         */
        removeObject: function(array, object)
        { 
            var index = array.indexOf(object, 0);
            (index == -1) || array.splice(index, 1);
        }
    };
    
    // "exports"
    game.dom = dom;
    game.ui = ui;
    game.utils = utils;    
	
// return the game module from global object
})((function(){return this}.call()));
