(function (game, undefined) {
    "use strict";
    
	/** 
     * Class Card
     * @class only created with new
     */
    function Card(name, src_front, src_back) {
        // private :            
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
        //flip_container.appendChild(flipper);
        
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
    
    // add to game object
    game.Card = Card;
	
// return the game module from global object
})((function(){return this}.call()).game);