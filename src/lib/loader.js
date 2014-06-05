/**
 * @fileOverview Easy DOM Image Loader Library
 * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
 */
 
 /** 
  * Closure that wraps the library code
  */
(function (global, undefined) { // begin global runtime closure

    //==============================================================================================
    //                                    Private Shared Fields
    //==============================================================================================
    var _images = {};  // keeps a reference for each image
    var _loaded = 0;   // number of images completely loaded
    var _loading = []; // concurrent load processes
    var _total = 0;    // number of images to load

    /**
     * DOM Image Loader
     * @author <a href="mailto:gustavo.carvalho@ufv.br">Gustavo Carvalho</a>
     * @class added to a specific context
     */
    Loader = function () { // begin constructor        
        //==========================================================================================
        //                                Private Instance Fields
        //==========================================================================================        
        var loaded = 0;
        var loading = false;
        var loadID = _loading.length;
        var total = 0;        
        
        // insert this object in the loader pool
        _loading[loadID] = false;        

        //==========================================================================================
        //                                Private Instance Methods
        //==========================================================================================

        // user defined callbacks        
        function onProgress() {}
        function onComplete() {}

        /**
         * Called when an image is loaded
         * @private
         * @function
         * @param
         * @return void
         */
        function onImageLoad(src) {
            ++loaded;
            ++_loaded;

            // console.log(src, " loaded");

            // call the user defined callback when an image is loaded
            onProgress.call();

            // check if all images (of this object) are loaded
            if (loaded === total) {
                _loading[loadID] = loading = false; 
                // _loading.splice(loadID, 1);
                // console.log("Load process", "#" + loadID, "complete.");
                onComplete();
            }
        }

        /**
         * Called when an error occur during the loading of an image
         * @private
         * @function
         * @param
         * @return void
         */
        function onImageError(e) {
            console.log("Error on loading image: " + e.srcElement);
        }

        /**
         * Load an image and set it to the images pool 
         * @private
         * @function
         * @param
         * @return Boolean
         */
        function loadImage(name, src) {
            try {
                _images[name] = new Image();
                _images[name].onload = function () {
                    onImageLoad(src);
                };
                _images[name].onerror = onImageError;
                _images[name].src = src;
            } catch (e) {
                console.log(e.message);
            }
            return true;
        }

        //==========================================================================================
        //                          Public Privileged Instance Methods
        //==========================================================================================

        /**
         * Get the overall progress of this loading process, in percentage
         * @public
         * @priviledged
         * @function
         * @return Number
         */
        this.getProgress = function () {
            return (loaded / total) * 100;
        };

        /**
         * If this loading process is still loading
         * @public
         * @priviledged
         * @function
         * @return Boolean
         */
        this.isLoading = function () {
            return loading;
        };

        /**
         * Load a set of images and call user callbacks onProgress and onComplete
         * @public
         * @priviledged
         * @function
         * @param
         * @return Loader
         */
        this.load = function (/**Array*/ images, /**Fuction*/ fnComplete, /**Function*/ fnProgress) {
            if (!loading) {
                loaded = 0;
                loading = true;
                _loading[loadID] = true;
                // console.log("Load process", "#" + loadID, "started.");

                try {
                    onProgress = fnProgress || (function () {});
                    onComplete = fnComplete || (function () {});
                    total = images.length;
                    _total += total;                
                    for (var i = 0; i < total; ++i) {
                        loadImage(images[i].name, images[i].src);
                    }
                } catch (e) {
                    console.log(e.message);
                }
            } else {
                throw new Error("Create another Loader object to enable concurrent loading.");
            }
        };

        return this;
    }; // end constructor

    //==============================================================================================
    //                                    Public Static Methods 
    //==============================================================================================

    /**
     * Get an image loaded from the shared image pool
     * @public
     * @static
     * @function
     * @param String name The name of the image.
     * @return Image
     */
    Loader.getImage = function (/**String*/ name) {
        if (_images[name]) {
            return _images[name];
        } else {
            return undefined;
        }
    };
    
    /**
     * Get the reference for the image pool object
     * @public
     * @static
     * @function
     * @param
     * @return Array
     */
    Loader.getImagesPool = function () {
        return _images;
    };

    /**
     * Get the overall global progress, in percentage
     * @public
     * @static
     * @function
     * @return Number
     */
    Loader.getProgress = function () {
        return (_loaded / _total) * 100;
    };

    /** 
     * Test if there is loading instances running
     * @public
     * @static
     * @function
     * @return Boolean false if all load instances has finished its tasks
     */
    Loader.isLoading = function () {
        for (var i = 0; i < _loading.length; ++i){
            if (_loading[i]) {
                return true;
            }
        }
        return false;
    };

    /**
     * Clear all shared fields of the class Loader, except the loading references of instances
     * @public
     * @static
     * @function
     * @return Boolean
     */
    Loader.clear = function () {
        if (!this.isLoading()) {
            _loaded = 0;
            _total = 0;       
            // _loading.length = 0;
            for (var name in _images) {
                _images[name] = null; // release memory
                delete _images[name]; // remove property
            }
            return true;
        }
        return false;
    };
    
    /* DEBUG only - print shared variables */
    Loader.printSharedStats = function (flag) {
        if (flag) {
            console.log(flag);
        }
        console.log("Images: ", _images);
        console.log("Loaded: ", _loaded);
        console.log("Total: ", _total);
        console.log("Lading: ", _loading);
    };
    
    // AMD and window support
	if (typeof define === "function") {
		define([], function () { return Loader; });
	} else if (typeof global.Loader === "undefined") {
		global.Loader = Loader;
    }

// get at whatever the global object is, like window in browsers
})((function(){return this}.call()));
