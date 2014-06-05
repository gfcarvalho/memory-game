(function (game, document, undefined) {
    "use strict";
    
    // "imports"
    var touch = game.system.touchSupported;
    var evts = game.events;
    var dom = game.dom;

    /**
     * Creates a new game board - singleton???
     * criar tabela de itens? onde item pode ser qq coisa?
     * passar tabela de itens e ent�o criar tabela dom baseado na tabela virtual?
     * criar classe item - qq coisa basta herdar de item(item s� precisa ter um campo node (HTMLElement))
     * @require Card
     */
    function Board(container, cards, rows, cols) {
        /*config = {
            container: default = document.body
            cards: lista de cards quantidade de cartas = cards.length
            
            width: depende
            height: depende
            paddings: // distancia da borda(horizontal e vertical)
            resize: tamanho fixo, ajustar a largura, a altura ou toda a tela
            margin: from container
            tamanho celula: uma vez sabendo o tamanho da tabela, calcular baseado na quantidade de cartas
            
        }*/
        
        this.container = container;
        this.board     = document.createElement("table");
        this.backBoard = [];        
        
        var i, j;
        var newRow;
        var newCell;
        var card;        
        this.board.className = "game-board";
        
        if (rows*cols < cards.length) {
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
    
    /*Board.prototype.addClickEvent = function (fn) {
        var card;
        var i, j;
        for( i = 0; i < this.backBoard.length; i++) {
            for( j = 0; j < this.backBoard[i].length; j++) { 
                card = this.backBoard[i][j];
                if (touch) {
                    card.node.addEventListener('touchstart', fn, false);
                } else {
                    card.node.addEventListener('mousedown', fn, false);
                }
            }
        }
    };*/
    
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
	
    // add this Class to the game object
    game.Board = Board;   
	
// return the game module from global object
})((function(){return this}.call()).game, (function(){return this}.call()).document);