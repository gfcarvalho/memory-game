(function (game, document, undefined) {

    /**
     * Creates a new game board
     * @require Card
     */
    function Board(config) {
        config = {
            container: default = document.body
            cards: quantidade de cartas
            
            width: depende
            height: depende
            paddings: // distancia da borda(horizontal e vertical)
            resize: tamanho fixo, ajustar a largura, a altura ou toda a tela
            margin: from container
            tamanho celula: uma vez sabendo o tamanho da tabela, calcular baseado na quantidade de cartas
            
        }
        var board = document.createElement("table");
        var backBoard = [];
    
        function getBoard() {
            return board;
        }
        
        function destroyBoard() {
        }
        
        function insertCard(card, i, j) {
        }
        
        function removeCards() {
            game.dom.removeChilds(gameTab);
        }
        
        function removeCard(card || (cardName && all) || position) {
            var card;
            var removed;
            var cell;
            
            if (arguments.length ===2 && typeof arguments[0] === "number") {
                var i = arguments[0];
                var j = arguments[1];
                card = this.findByIndex(i, j);
                cell = card.node.parentNode;
                game.dom.removeChilds(cell);
            } else {
            
                card = arguments[0];
                if (card instanceof Card) {
                    cell = card.node.parentNode;
                    game.dom.removeChilds(cell);
                } else if (typeof card === "string") {
                    card = this.findByName(card);
                    cell = card.node.parentNode;
                    game.dom.removeChilds(cell);
                }
            }            
            
            return card;
        }
        
        function findByIndex(i, j) {
            return backBoard[i][j];
            //return board.rows.item(i).cells.item(j).children.item(0);
        }
        
        function findByName(cardName) {
            var i, j;
            var card;
            
            for( i = 0; i < board.length; i++) {
                for( j = 0; j < board[i].length; j++) {
                    card = gameBoard[i][j];
                    if (card.name === cardName) {
                        return card;
                    }
                    
                }
            }
            return undefined;
            // return board.querySelector(cardName);
        }
        
    }
	
    game.Board = Board;   
	
// return the game module from global object
})((function(){return this}.call()).game, (function(){return this}.call()).document);
