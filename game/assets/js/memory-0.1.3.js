/*global define*/
(function (global, undefined) {
	"use strict";

	var document = global.document,
	    Alertify;

	Alertify = function () {

		var _alertify = {},
		    dialogs   = {},
		    isopen    = false,
		    keys      = { ENTER: 13, ESC: 27, SPACE: 32 },
		    queue     = [],
		    $, btnCancel, btnOK, btnReset, btnResetBack, btnFocus, elCallee, elCover, elDialog, elLog, form, input, getTransitionEvent;

		/**
		 * Markup pieces
		 * type {Object}
		 */
		dialogs = {
			buttons : {
				holder : "<nav class=\"alertify-buttons\">{{buttons}}</nav>",
				submit : "<button type=\"submit\" class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
				ok     : "<button class=\"alertify-button alertify-button-ok\" id=\"alertify-ok\">{{ok}}</button>",
				cancel : "<button class=\"alertify-button alertify-button-cancel\" id=\"alertify-cancel\">{{cancel}}</button>"
			},
			input   : "<div class=\"alertify-text-wrapper\"><input type=\"text\" class=\"alertify-text\" id=\"alertify-text\"></div>",
			message : "<p class=\"alertify-message\">{{message}}</p>",
			log     : "<article class=\"alertify-log{{class}}\">{{message}}</article>"
		};

		/**
		 * Return the proper transitionend event
		 * @return {String}    Transition type string
		 */
		getTransitionEvent = function () {
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
		};

		/**
		 * Shorthand for document.getElementById()
		 *
		 * @param  {String} id    A specific element ID
		 * @return {Object}       HTML element
		 */
		$ = function (id) {
			return document.getElementById(id);
		};

		/**
		 * Alertify private object
		 * type {Object}
		 */
		_alertify = {

			/**
			 * Labels object
			 * @type {Object}
			 */
			labels : {
				ok     : "OK",
				cancel : "Cancel"
			},

			/**
			 * Delay number
			 * @type {Number}
			 */
			delay : 5000,

			/**
			 * Whether buttons are reversed (default is secondary/primary)
			 * @type {Boolean}
			 */
			buttonReverse : false,

			/**
			 * Which button should be focused by default
			 * @type {String}	"ok" (default), "cancel", or "none"
			 */
			buttonFocus : "ok",

			/**
			 * Set the transition event on load
			 * @type {[type]}
			 */
			transition : undefined,

			/**
			 * Set the proper button click events
			 *
			 * @param {Function} fn    [Optional] Callback function
			 *
			 * @return {undefined}
			 */
			addListeners : function (fn) {
				var hasOK     = (typeof btnOK !== "undefined"),
				    hasCancel = (typeof btnCancel !== "undefined"),
				    hasInput  = (typeof input !== "undefined"),
				    val       = "",
				    self      = this,
				    ok, cancel, common, key, reset;

				// ok event handler
				ok = function (event) {
					if (typeof event.preventDefault !== "undefined") event.preventDefault();
					common(event);
					if (typeof input !== "undefined") val = input.value;
					if (typeof fn === "function") {
						if (typeof input !== "undefined") {
							fn(true, val);
						}
						else fn(true);
					}
					return false;
				};

				// cancel event handler
				cancel = function (event) {
					if (typeof event.preventDefault !== "undefined") event.preventDefault();
					common(event);
					if (typeof fn === "function") fn(false);
					return false;
				};

				// common event handler (keyup, ok and cancel)
				common = function (event) {
					self.hide();
					self.unbind(document.body, "keyup", key);
					self.unbind(btnReset, "focus", reset);
					if (hasOK) self.unbind(btnOK, "click", ok);
					if (hasCancel) self.unbind(btnCancel, "click", cancel);
				};

				// keyup handler
				key = function (event) {
					var keyCode = event.keyCode;
					if ((keyCode === keys.SPACE && !hasInput) || (hasInput && keyCode === keys.ENTER)) ok(event);
					if (keyCode === keys.ESC && hasCancel) cancel(event);
				};

				// reset focus to first item in the dialog
				reset = function (event) {
					if (hasInput) input.focus();
					else if (!hasCancel || self.buttonReverse) btnOK.focus();
					else btnCancel.focus();
				};

				// handle reset focus link
				// this ensures that the keyboard focus does not
				// ever leave the dialog box until an action has
				// been taken
				this.bind(btnReset, "focus", reset);
				this.bind(btnResetBack, "focus", reset);
				// handle OK click
				if (hasOK) this.bind(btnOK, "click", ok);
				// handle Cancel click
				if (hasCancel) this.bind(btnCancel, "click", cancel);
				// listen for keys, Cancel => ESC
				this.bind(document.body, "keyup", key);
				if (!this.transition.supported) {
					this.setFocus();
				}
			},

			/**
			 * Bind events to elements
			 *
			 * @param  {Object}   el       HTML Object
			 * @param  {Event}    event    Event to attach to element
			 * @param  {Function} fn       Callback function
			 *
			 * @return {undefined}
			 */
			bind : function (el, event, fn) {
				if (typeof el.addEventListener === "function") {
					el.addEventListener(event, fn, false);
				} else if (el.attachEvent) {
					el.attachEvent("on" + event, fn);
				}
			},

			/**
			 * Use alertify as the global error handler (using window.onerror)
			 *
			 * @return {boolean} success
			 */
			handleErrors : function () {
				if (typeof global.onerror !== "undefined") {
					var self = this;
					global.onerror = function (msg, url, line) {
						self.error("[" + msg + " on line " + line + " of " + url + "]", 0);
					};
					return true;
				} else {
					return false;
				}
			},

			/**
			 * Append button HTML strings
			 *
			 * @param {String} secondary    The secondary button HTML string
			 * @param {String} primary      The primary button HTML string
			 *
			 * @return {String}             The appended button HTML strings
			 */
			appendButtons : function (secondary, primary) {
				return this.buttonReverse ? primary + secondary : secondary + primary;
			},

			/**
			 * Build the proper message box
			 *
			 * @param  {Object} item    Current object in the queue
			 *
			 * @return {String}         An HTML string of the message box
			 */
			build : function (item) {
				var html    = "",
				    type    = item.type,
				    message = item.message,
				    css     = item.cssClass || "";

				html += "<div class=\"alertify-dialog\">";
				html += "<a id=\"alertify-resetFocusBack\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";

				if (_alertify.buttonFocus === "none") html += "<a href=\"#\" id=\"alertify-noneFocus\" class=\"alertify-hidden\"></a>";

				// doens't require an actual form
				if (type === "prompt") html += "<div id=\"alertify-form\">";

				html += "<article class=\"alertify-inner\">";
				html += dialogs.message.replace("{{message}}", message);

				if (type === "prompt") html += dialogs.input;

				html += dialogs.buttons.holder;
				html += "</article>";

				if (type === "prompt") html += "</div>";

				html += "<a id=\"alertify-resetFocus\" class=\"alertify-resetFocus\" href=\"#\">Reset Focus</a>";
				html += "</div>";

				switch (type) {
				case "confirm":
					html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.ok));
					html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
					break;
				case "prompt":
					html = html.replace("{{buttons}}", this.appendButtons(dialogs.buttons.cancel, dialogs.buttons.submit));
					html = html.replace("{{ok}}", this.labels.ok).replace("{{cancel}}", this.labels.cancel);
					break;
				case "alert":
					html = html.replace("{{buttons}}", dialogs.buttons.ok);
					html = html.replace("{{ok}}", this.labels.ok);
					break;
				default:
					break;
				}

				elDialog.className = "alertify alertify-" + type + " " + css;
				elCover.className  = "alertify-cover";
				return html;
			},

			/**
			 * Close the log messages
			 *
			 * @param  {Object} elem    HTML Element of log message to close
			 * @param  {Number} wait    [optional] Time (in ms) to wait before automatically hiding the message, if 0 never hide
			 *
			 * @return {undefined}
			 */
			close : function (elem, wait) {
				// Unary Plus: +"2" === 2
				var timer = (wait && !isNaN(wait)) ? +wait : this.delay,
				    self  = this,
				    hideElement, transitionDone;

				// set click event on log messages
				this.bind(elem, "click", function () {
					hideElement(elem);
				});
				// Hide the dialog box after transition
				// This ensure it doens't block any element from being clicked
				transitionDone = function (event) {
					event.stopPropagation();
					// unbind event so function only gets called once
					self.unbind(this, self.transition.type, transitionDone);
					// remove log message
					elLog.removeChild(this);
					if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
				};
				// this sets the hide class to transition out
				// or removes the child if css transitions aren't supported
				hideElement = function (el) {
					// ensure element exists
					if (typeof el !== "undefined" && el.parentNode === elLog) {
						// whether CSS transition exists
						if (self.transition.supported) {
							self.bind(el, self.transition.type, transitionDone);
							el.className += " alertify-log-hide";
                            
                            // included by GUSTAVO - remove element anyway
                            /*setTimeout(function () {
                                elLog.removeChild(el);
                                if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
                           }, 1000);*/
                            
						} else {
							elLog.removeChild(el);
							if (!elLog.hasChildNodes()) elLog.className += " alertify-logs-hidden";
						}
					}
				};
				// never close (until click) if wait is set to 0
				if (wait === 0) return;
				// set timeout to auto close the log message
				setTimeout(function () { hideElement(elem); }, timer);
			},

			/**
			 * Create a dialog box
			 *
			 * @param  {String}   message        The message passed from the callee
			 * @param  {String}   type           Type of dialog to create
			 * @param  {Function} fn             [Optional] Callback function
			 * @param  {String}   placeholder    [Optional] Default value for prompt input field
			 * @param  {String}   cssClass       [Optional] Class(es) to append to dialog box
			 *
			 * @return {Object}
			 */
			dialog : function (message, type, fn, placeholder, cssClass) {
				// set the current active element
				// this allows the keyboard focus to be resetted
				// after the dialog box is closed
				elCallee = document.activeElement;
				// check to ensure the alertify dialog element
				// has been successfully created
				var check = function () {
					if ((elLog && elLog.scrollTop !== null) && (elCover && elCover.scrollTop !== null)) return;
					else check();
				};
				// error catching
				if (typeof message !== "string") throw new Error("message must be a string");
				if (typeof type !== "string") throw new Error("type must be a string");
				if (typeof fn !== "undefined" && typeof fn !== "function") throw new Error("fn must be a function");
				// initialize alertify if it hasn't already been done
				this.init();
				check();

				queue.push({ type: type, message: message, callback: fn, placeholder: placeholder, cssClass: cssClass });
				if (!isopen) this.setup();

				return this;
			},

			/**
			 * Extend the log method to create custom methods
			 *
			 * @param  {String} type    Custom method name
			 *
			 * @return {Function}
			 */
			extend : function (type) {
				if (typeof type !== "string") throw new Error("extend method must have exactly one paramter");
				return function (message, wait) {
					this.log(message, type, wait);
					return this;
				};
			},

			/**
			 * Hide the dialog and rest to defaults
			 *
			 * @return {undefined}
			 */
			hide : function () {
				var transitionDone,
				    self = this;
				// remove reference from queue
				queue.splice(0,1);
				// if items remaining in the queue
				if (queue.length > 0) this.setup(true);
				else {
					isopen = false;
					// Hide the dialog box after transition
					// This ensure it doens't block any element from being clicked
					transitionDone = function (event) {
						event.stopPropagation();
						// unbind event so function only gets called once
						self.unbind(elDialog, self.transition.type, transitionDone);
					};
					// whether CSS transition exists
					if (this.transition.supported) {
						this.bind(elDialog, this.transition.type, transitionDone);
						elDialog.className = "alertify alertify-hide alertify-hidden";
					} else {
						elDialog.className = "alertify alertify-hide alertify-hidden alertify-isHidden";
					}
					elCover.className  = "alertify-cover alertify-cover-hidden";
					// set focus to the last element or body
					// after the dialog is closed
					elCallee.focus();
				}
			},

			/**
			 * Initialize Alertify
			 * Create the 2 main elements
			 *
			 * @return {undefined}
			 */
			init : function () {
				// ensure legacy browsers support html5 tags
				document.createElement("nav");
				document.createElement("article");
				document.createElement("section");
				// cover
				if ($("alertify-cover") == null) {
					elCover = document.createElement("div");
					elCover.setAttribute("id", "alertify-cover");
					elCover.className = "alertify-cover alertify-cover-hidden";
					document.body.appendChild(elCover);
				}
				// main element
				if ($("alertify") == null) {
					isopen = false;
					queue = [];
					elDialog = document.createElement("section");
					elDialog.setAttribute("id", "alertify");
					elDialog.className = "alertify alertify-hidden";
					document.body.appendChild(elDialog);
				}
				// log element
				if ($("alertify-logs") == null) {
					elLog = document.createElement("section");
					elLog.setAttribute("id", "alertify-logs");
					elLog.className = "alertify-logs alertify-logs-hidden";
					document.body.appendChild(elLog);
				}
				// set tabindex attribute on body element
				// this allows script to give it focus
				// after the dialog is closed
				document.body.setAttribute("tabindex", "0");
				// set transition type
				this.transition = getTransitionEvent();
			},

			/**
			 * Show a new log message box
			 *
			 * @param  {String} message    The message passed from the callee
			 * @param  {String} type       [Optional] Optional type of log message
			 * @param  {Number} wait       [Optional] Time (in ms) to wait before auto-hiding the log
			 *
			 * @return {Object}
			 */
			log : function (message, type, wait) {
				// check to ensure the alertify dialog element
				// has been successfully created
				var check = function () {
					if (elLog && elLog.scrollTop !== null) return;
					else check();
				};
				// initialize alertify if it hasn't already been done
				this.init();
				check();

				elLog.className = "alertify-logs";
				this.notify(message, type, wait);
				return this;
			},

			/**
			 * Add new log message
			 * If a type is passed, a class name "alertify-log-{type}" will get added.
			 * This allows for custom look and feel for various types of notifications.
			 *
			 * @param  {String} message    The message passed from the callee
			 * @param  {String} type       [Optional] Type of log message
			 * @param  {Number} wait       [Optional] Time (in ms) to wait before auto-hiding
			 *
			 * @return {undefined}
			 */
			notify : function (message, type, wait) {
				var log = document.createElement("article");
				log.className = "alertify-log" + ((typeof type === "string" && type !== "") ? " alertify-log-" + type : "");
				log.innerHTML = message;
				// append child
				elLog.appendChild(log);
				// triggers the CSS animation
				setTimeout(function() { log.className = log.className + " alertify-log-show"; }, 50);
				this.close(log, wait);
			},

			/**
			 * Set properties
			 *
			 * @param {Object} args     Passing parameters
			 *
			 * @return {undefined}
			 */
			set : function (args) {
				var k;
				// error catching
				if (typeof args !== "object" && args instanceof Array) throw new Error("args must be an object");
				// set parameters
				for (k in args) {
					if (args.hasOwnProperty(k)) {
						this[k] = args[k];
					}
				}
			},

			/**
			 * Common place to set focus to proper element
			 *
			 * @return {undefined}
			 */
			setFocus : function () {
				if (input) {
					input.focus();
					input.select();
				}
				else btnFocus.focus();
			},

			/**
			 * Initiate all the required pieces for the dialog box
			 *
			 * @return {undefined}
			 */
			setup : function (fromQueue) {
				var item = queue[0],
				    self = this,
				    transitionDone;

				// dialog is open
				isopen = true;
				// Set button focus after transition
				transitionDone = function (event) {
					event.stopPropagation();
					self.setFocus();
					// unbind event so function only gets called once
					self.unbind(elDialog, self.transition.type, transitionDone);
				};
				// whether CSS transition exists
				if (this.transition.supported && !fromQueue) {
					this.bind(elDialog, this.transition.type, transitionDone);
				}
				// build the proper dialog HTML
				elDialog.innerHTML = this.build(item);
				// assign all the common elements
				btnReset  = $("alertify-resetFocus");
				btnResetBack  = $("alertify-resetFocusBack");
				btnOK     = $("alertify-ok")     || undefined;
				btnCancel = $("alertify-cancel") || undefined;
				btnFocus  = (_alertify.buttonFocus === "cancel") ? btnCancel : ((_alertify.buttonFocus === "none") ? $("alertify-noneFocus") : btnOK),
				input     = $("alertify-text")   || undefined;
				form      = $("alertify-form")   || undefined;
				// add placeholder value to the input field
				if (typeof item.placeholder === "string" && item.placeholder !== "") input.value = item.placeholder;
				if (fromQueue) this.setFocus();
				this.addListeners(item.callback);
			},

			/**
			 * Unbind events to elements
			 *
			 * @param  {Object}   el       HTML Object
			 * @param  {Event}    event    Event to detach to element
			 * @param  {Function} fn       Callback function
			 *
			 * @return {undefined}
			 */
			unbind : function (el, event, fn) {
				if (typeof el.removeEventListener === "function") {
					el.removeEventListener(event, fn, false);
				} else if (el.detachEvent) {
					el.detachEvent("on" + event, fn);
				}
			}
		};

		return {
			alert   : function (message, fn, cssClass) { _alertify.dialog(message, "alert", fn, "", cssClass); return this; },
			confirm : function (message, fn, cssClass) { _alertify.dialog(message, "confirm", fn, "", cssClass); return this; },
			extend  : _alertify.extend,
			init    : _alertify.init,
			log     : function (message, type, wait) { _alertify.log(message, type, wait); return this; },
			prompt  : function (message, fn, placeholder, cssClass) { _alertify.dialog(message, "prompt", fn, placeholder, cssClass); return this; },
			success : function (message, wait) { _alertify.log(message, "success", wait); return this; },
			error   : function (message, wait) { _alertify.log(message, "error", wait); return this; },
			set     : function (args) { _alertify.set(args); },
			labels  : _alertify.labels,
			debug   : _alertify.handleErrors
		};
	};

	// AMD and window support
	if (typeof define === "function") {
		define([], function () { return new Alertify(); });
	} else if (typeof global.alertify === "undefined") {
		global.alertify = new Alertify();
	}

}(this));
/*jslint vars: true */
/*jslint indent: 4 */
/*jslint white: false */
/*jslint browser: true */
/*jslint devel: true */

/** 
 *  ImageManager.js
 *  @author <a href="mailto:gfcarv@gmail.com">Gustavo Carvalho</a>
 */
(function (global, undefined) {
    'use strict';
    
    /**
    * Make debug using console safe in all browsers
    * @constructor
    */
    function JSDebugger(tag, mode) {
        
        var EMPTY = function () {},
            TAG = '[JSDebugger]';
        
        this.error = EMPTY;
        this.info = EMPTY;
        this.log = EMPTY;
        this.warn = EMPTY;
        
        if (!global.console || typeof global.console === 'undefined') {
            return this;
        }
        
        switch (mode) {
        case 0: // none (no messages are shown)                
            this.error = EMPTY;
            this.info = EMPTY;
            this.log = EMPTY;
            this.warn = EMPTY;
            return this;
        case 1: // debug (show info and logs only)
            console.info(TAG, tag, 'MODE: Logs and Info only');
            this.error = EMPTY;
            this.info = console.info.bind(console, tag);
            this.log = console.log.bind(console, tag);
            this.warn = EMPTY;
            return this;
        case 2: // errors (show errors only)
            console.info(TAG, tag, 'MODE: Errors only');
            this.error = console.error.bind(console, tag);
            this.info = EMPTY;
            this.log = EMPTY;
            this.warn = EMPTY;
            return this;
        default: // verbose (show all messages)
            console.info(TAG, tag, 'MODE: Verbose');
            this.error = console.error.bind(console, tag);
            this.info = console.info.bind(console, tag);
            this.log = console.log.bind(console, tag);
            this.warn = console.warn.bind(console, tag);
            return this;
        }
    }
    
    /**
    * ID Generator
    * Generate sequential unique numerical ID's
    * @construtor
    */
    function IdGenerator() {
        var id = 0;
        this.generate = function () {
            id += 1;
            return id;
        };
    }

    /**
    * ImageManager
    */
    var ImageManager = (function (undefined) {
        var EMPTY_FN = function () {}, // a function that simple returns undefined
            debug, // new instance of JSDebbuger
            idGenerator, // an instance of IdGenerator
            cache, // keeps a reference for each image
            cacheSize, // number of images completely loaded
            totalToLoad, // number of images to load
            loadStack, // hold all load processes
            loadStackSize; // track the length of loadStack

        debug = new JSDebugger('[ImageManager]', 0);
        idGenerator = new IdGenerator();
        
        cache = {};
        cacheSize = 0;
        totalToLoad = 0;
        loadStack = {};
        loadStackSize = 0;
        
        /**
         * kill an especific LoadProcess instance
         * @private
         */
        function endProcess(id) {
            debug.log('Ending load process:', id);
            if (loadStack.hasOwnProperty(id)) {
                loadStack[id].clear();
                loadStack[id] = null; // release memory
                delete loadStack[id]; // remove property
                loadStackSize -= 1;
            }
        }

        /**
         * Creates a process that controls the loading of an image or a set of images
         * @private
         * @constructor
         */
        function LoadProcess() {
            var instance = this, // capture the instance of this process
                instanceID = '#' + idGenerator.generate(), // generate a unique id
                collection = {}, // hold the images of this process
                loaded = 0, // number of images of this instance that has finish load              
                toLoad = 0, // number of images remaining
                errors = 0, // number of images with errors
                loading = false, // true if this load process is running, false otherwise
                onProgress = EMPTY_FN, // user defined callback
                onComplete = EMPTY_FN; // user defined callback

            /**
             * Called when an image is loaded
             * @private
             */
            function onImageLoad(name, src, onload) {
                loaded += 1;
                cache[name] = collection[name];
                cacheSize += 1;
                
                debug.log(collection[name].src, '  loaded');

                // call the user defined onload callback for a specific image when it's loaded
                onload.call(cache[name]);

                // call the user defined onProgress callback when any image is loaded
                onProgress.call(undefined, instance.getProgress());

                // check if all images (of this instance) are loaded with or without errors,
                // call the onComplete callback and kill the thread                
                if (loaded === toLoad) {
                    loading = false;
                    
                    endProcess(instanceID);
                    debug.log('Load process', instanceID, 'done with no errors.');
                    
                    onComplete.call(undefined, {code: 1, errors: 0});
                    
                } else if (loaded + errors === toLoad) {
                    loading = false;
                    
                    endProcess(instanceID);
                    debug.warn('Load process', instanceID, 'done with', errors, 'errors');
                    
                    onComplete.call(undefined, {code: 0, errors: errors});
                }
            }

            /**
             * Load an image from an object definition and set it to the images pool
             * @private
             */
            function loadImage(obj) {
                var name = null,
                    src = null,
                    tagName = null,
                    onload = EMPTY_FN,
                    onerror = EMPTY_FN;

                // validate name property
                if (obj.name && typeof obj.name === 'string') {
                    name = obj.name;
                    if (cache.hasOwnProperty(name)) {
                        debug.warn('Duplicated names found. Overwriting', name);
                    }
                } else {
                    throw new Error('Missing or invalid name property. Check your image(s) object(s)');
                }

                // validate src property
                if (obj.src && typeof obj.src === 'string') {
                    src = obj.src;
                } else {
                    throw new Error('Missing or invalid src property. Check your image(s) object(s)');
                }

                // validate the onload and on error properties
                if (obj.onload && typeof obj.onload === 'function') {
                    onload = obj.onload;
                }
                if (obj.onerror && typeof obj.onerror === 'function') {
                    onerror = obj.onerror;
                }

                // TAG LOADER:
                // creates a new Image object and add it to this instance's collection
                
                collection[name] = new Image();
                //collection[name].name = name;
                collection[name].name = tagName;
                collection[name].onload = function () {
                    onImageLoad(name, src, onload);
                };
                collection[name].onerror = function (e) {
                    errors += 1;
                    onerror.call(this, e);
                    if (loaded + errors === toLoad) {
                        loading = false;
                        onComplete.call(undefined, {code: 0, errors: errors});

                        debug.warn('Load process', instanceID, 'done with', errors, 'errors');
                        endProcess(instanceID); // kill this load thread
                    }
                };
                collection[name].src = src;
            }
            
             /**
             * Get the ID of this loading process
             * @priviledged
             * @function
             * @return Number
             */
            this.getId = function () {
                return instanceID;
            };

            /**
             * Get the overall progress of this loading process, in percentage
             * @priviledged
             * @function
             * @return Number
             */
            this.getProgress = function () {
                return (loaded / toLoad) * 100;
            };

            /**
             * If this loading process is still loading
             * @priviledged
             * @function
             * @return Boolean
             */
            this.isLoading = function () {
                return loading;
            };
            
            /**
             * Release the memory of a load process
             * @priviledged
             * @function
             * @return Boolean
             */
            this.clear = function () {
                var img;
                for (img in collection) {
                    if (collection.hasOwnProperty(img)) {
                        collection[img] = null;
                        delete collection[img];
                    }
                }
                instance = null;
                collection = null;
                loaded = null;
                toLoad = null;
                errors = null;
                loading = null;
                //instanceID = null;
                //onProgress = null;
                //onComplete = null;
            };
            
            /**
             * Load an image or a set(Array) of images
             * @priviledged
             * @function
             * @param
             * @return ImageManager
             */
            this.load = function (images, fnComplete, fnProgress) {
                var i;
                if (!loading) {
                    loaded = 0;
                    loading = true;
                    debug.log('Load process', instanceID, 'started.');
                    try {
                        onProgress = fnProgress || EMPTY_FN;
                        onComplete = fnComplete || EMPTY_FN;
                        if (images instanceof Array) {
                            toLoad = images.length;
                            totalToLoad += toLoad;
                            for (i = 0; i < toLoad; i += 1) {
                                loadImage(images[i]);
                            }
                        } else { // assumes a single Image Object
                            toLoad += 1;
                            totalToLoad += 1;
                            loadImage(images);
                        }
                    } catch (e) {
                        debug.warn(e.message);
                    } finally {
                        return this;
                    }
                }

                // return the reference for this thread to allow chaining
                return this;
            };

        }

        /**
         * Get an image loaded from the shared image pool
         * @public
         * @static
         * @function
         * @param name {String} The name of the image.
         * @return Image
         */
        function getImage(name) {
            if (cache.hasOwnProperty(name)) {
                return cache[name];
            }
        }
        
        /**
         * Creates a new Image tag as a copy of an image in cache
         */
        function cloneImage(name) { // TODO: allow an Image as parameter 
            var img = new Image();
            if (cache.hasOwnProperty(name)) {
                img.name = cache[name].name;
                img.src = cache[name].src;
                return img;
            }
        }

        /**
         * Get the overall global progress, in percentage
         * @public
         * @static
         * @return Number
         */
        function getProgress() {
            return (cacheSize / totalToLoad) * 100;
        }

        /**
         * Test if there is any LoadProcess instances running
         * @public
         * @static
         * @return Boolean false if all load instances has finished its tasks
         */
        function hasNoProcess() {
            return loadStackSize === 0;
        }

        /**
         * Clear cache and the process stack
         * Not works if there is any load process running
         * @public
         * @static
         * @return {Boolean} will return true if clear was successful, and
         *     false otherwise (if there are loading tasks still performing)
         */
        function clear() {
            var image,
                process;
            if (hasNoProcess()) {
                for (image in cache) {
                    if (cache.hasOwnProperty(image)) {
                        cache[image] = null; // release memory
                        delete cache[image]; // remove property
                    }
                }
                for (process in loadStack) {
                    if (loadStack.hasOwnProperty(process)) {
                        loadStack[process].clear();
                        loadStack[process] = null; // release memory
                        delete loadStack[process]; // remove property
                    }
                }
                cacheSize = 0;
                loadStackSize = 0;
                totalToLoad = 0;
                return true; // clear success
            }
            return false; // clear fail
        }
        
        /**
         * Load an image or a set of images and call the callbacks
         * @public
         * @static
         * @param {Object or Array} img an object or an array of objects with image properties
         * @param {function} fnC onComplete callback
         * @param {function} fnP onProgress callback
         */
        function newProcess(img, fnC, fnP) {
            var process = new LoadProcess();
            loadStack[process.getId()] = process.load(img, fnC, fnP);
            loadStackSize += 1;
        }
        
        /**
         * Remove the given image from cache
         * @public
         * @static
         * @param {String} name the name of the image to be removed from cache
         */
        function removeFromCache(name) {
            /*var domImgs,
                i;*/
            if (cache.hasOwnProperty(name)) {
                /*domImgs = document.getElementsByName(name);
                for (i = 0; i < domImgs.length; i += 1) {
                    domImgs[i].remove();
                }*/
                cache[name] = null;
                delete cache[name];
            }
            cacheSize -= 1;
            totalToLoad -= 1;
        }
        
        /**
         * debug purposes only
         */
        function debugMode(mode) {
            debug = null;
            debug = new JSDebugger('[ImageManager]', mode);
        }

        // public API
        return {
            load : newProcess,
            getProgress : getProgress,
            hasFinished : hasNoProcess,
            getImage : getImage,
            cloneImage : cloneImage,
            clear : clear,
            cache : cache,
            remove : removeFromCache
            //debugMode : debugMode
        };

    }());

    // AMD, CommonJS and Window support
    if (typeof define === 'function') {
        define([], function () {
            return ImageManager;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = ImageManager;
    } else if (typeof global.ImageManager === 'undefined') {
        global.ImageManager = ImageManager;
    }

// get at whatever the global object is, like window in browsers
}((function () { return this; }())));
(function (global, undefined) {
    "use strict";
    
    // "import" the correct document
    var document = global.document;
    
    var game;
    
    /** The game engine */
    game = {
            mod : "development",
            version : "0.1.3",                  
            
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
(function (global, undefined) {

    // "imports"
    var document = global.document;
    var game = global.game;

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
    
    // "exports"
    game.system = system;    
	
})((function(){return this}.call()));
/**
 * -preserve MinPubSub
 * A micro publish/subscribe messaging framework
 * @author Copyright (c) 2011 Daniel Lamb <daniellmb.com>
 * @see https://github.com/daniellmb/MinPubSub
 * Licensed under the MIT license.
 */
(function (global, undefined) {
    
    // "imports"
    var game = global.game;

	/**
	 * Event Manager. 
	 * @namespace
	 * @memberOf game
	 */	
	var events = (function () {				
		/** topic/subscription hash
		 * @private
		 */
		var cache = {};	
        
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
    
    // "exports"
    game.events = events;

})((function(){return this}.call()));
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
(function (global, undefined) {
    "use strict";
    
    var game = global.game; // get a local copy ("import") of game variable
    
	/** 
     * Card constructor
     * @constructor only created with new
     */
    function Card(name, src_front, src_back) {
        // private:
        
        var flip_container;  // a div element that contains the whole card
        var flipper;         // a div inside the container used to animator the cards (see card.css)
        var front;           // the div that contains the front image 
        var back;            // the div that contains the back image
        var front_img;       // the front Image
        var back_img;        // the back Image        
        var animator;        // a div used to animate the cards when they are right chosen
        
        // initialization code :
        
        flip_container = document.createElement('div');
        flip_container.className ='flip-container';
        flip_container.name = name;

        flipper = document.createElement('div');
        flipper.className = "flipper";        
        
        animator = document.createElement('div');
        animator.className = "animator";

        front = document.createElement('div');
        front.className = "front";
        front_img = new Image();
        front_img.src = src_front;
        front_img.className = "card-face";    
        front.appendChild(front_img);
        

        back = document.createElement('div');
        back.className = "back";  
        back_img = new Image();
        back_img.src = src_back;
        back_img.className = "card-face";
        back.appendChild(back_img);
        

        flipper.appendChild(front);
        flipper.appendChild(back);
        
        // independent node for other graphics iterations (isolated from flip card) 
        animator.appendChild(flipper);        
        flip_container.appendChild(animator);
        
        // public :
        
        /** 
         * the html node that contains the whole card
         * @public
         * @type HTMLDivElement         
         */
        this.node = flip_container;
        
        /** 
         * the name of the card
         * @public
         * @type String         
         */        
        this.name = name;
        /** 
         * true if the card can be clicked, false otherwise 
         * @public
         * @type Boolean
         */
        this.hold = false;
        /** 
         * no more actions needed for this card what so ever 
         * @public
         * @type Boolean
         */
        this.done = false;
        
        return this;
    }
    
    /**
     * Flip the cards using CSS3
     * @public
     * @function
     */
    Card.prototype.flip = function () {
        if (!this.hold && !this.done) {
            this.node.classList.toggle("flip");
        }
    };   

    Card.prototype.found = function () {
        this.done = true;
        setTimeout(function () {
            this.node.classList.toggle("animate");
        }.bind(this), 800); // 0 before            
    };
    
    Card.prototype.block = function () {
        this.hold = true;
    };
    
    Card.prototype.release = function () {
        this.hold = false;
    };
    
    // exports
    game.Card = Card;
	
// return the game module from global object
})((function(){return this}.call()));
(function (global, undefined) {
    "use strict";
    
    // "imports"
    var document = global.document;
    var game = global.game;
    var touch = game.system.touchSupported;
    var evts = game.events;
    var dom = game.dom;

    /**
     * Board constructor: Creates a new game board
     * @constructor only created with new
     * @require Card
     */
    function Board(container, cards, rows, cols) {
        
        this.container = container;
        this.board     = document.createElement("table");
        this.backBoard = [];        
        
        var i, j;
        var newRow;
        var newCell;
        var card;        
        this.board.className = "game-board";
        
        if (rows * cols < cards.length) {
            throw new Error("configuracoes invalidas");
        }

        // mount the table
        for( i = 0; i < rows; i++) {
            // insert a new row
            this.backBoard[i] = []; 
            newRow = this.board.insertRow(i);

            for( j = 0; j < cols; j++) {
                // insert a new cell and put a card on the board
                this.backBoard[i][j] = card = cards.pop();
                newCell  = newRow.insertCell(j);              
                newCell.appendChild(card.node);
                
                // click event
                if (touch) {
                    newCell.addEventListener('touchstart', this.onClick, false);
                } else {
                    newCell.addEventListener('mousedown', this.onClick, false);
                }
            }
        }
        
        // add the created board to container
        this.container.appendChild(this.board);
        
        return this;
    }
    
    Board.prototype.destroy = function () {
        dom.removeChilds(this.container);
        this.board     = null;
        this.backBoard = null;
    };
    
    Board.prototype.getTableElement = function () {
            return this.board;
    };
        
    Board.prototype.getBoard = function () {
            return this.backBoard;
    };
    
    Board.prototype.flipAllCards = function (delay) {
        var i, j;
        // wait the delay time and flip all cards that are in the board
        setTimeout(function () {
            for( i = 0; i < this.backBoard.length; i++) {
                for( j = 0; j < this.backBoard[i].length; j++) {
                    this.backBoard[i][j].flip();
                }
            } 
        }.bind(this), delay);
    };

    
    Board.prototype.fadeIn = function () {
        setTimeout(function() {
            this.board.classList.toggle("fadeIn");
        }.bind(this), 1);
    };
    
    /**
     * @return {Array} of Cards - a list of the cards with same name
     */
    Board.prototype.getCardsByName = function (cardName) {
            var i, j;
            var card;
            var cards = [];
            
            for (i = 0; i < this.backBoard.length; i++) {
                for (j = 0; j < this.backBoard[i].length; j++) {
                    card = this.backBoard[i][j];
                    if (card.name === cardName) {
                        return cards.push(card);
                    }                    
                }
            }
            return cards;
    };
    
    /**
     * @return {Card} the Card in a specific cell
     */
    Board.prototype.getCard = function (cell) {
        var cellIndex  = cell.cellIndex;
        var rowIndex = cell.parentNode.rowIndex;
        return this.backBoard[rowIndex][cellIndex];
    };
    
    Board.prototype.onClick = function (e) {
        var cellIndex  = this.cellIndex;
        var rowIndex = this.parentNode.rowIndex;
        evts.dispatchEvent("cellclick", [{
            event: e, // propagate the original event 
            cell: this,
            //item: this.backBoard[rowIndex][cellIndex],
            preventDefault: e.preventDefault.bind(e)
        }]);
    };
	
    // "exports"
    game.Board = Board;   
	
// return the game module from global object
})((function(){return this}.call()));
