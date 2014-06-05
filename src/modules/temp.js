//função click não otimizada 
function onCellClick(e) {    
          e.preventDefault();
          var thisCard = gameBoard.getCard(e.cell);          

          // this card can be clicked?
          if(!thisCard.hold && !thisCard.done && canClick) { // yes? 
              game.ui.log(thisCard.name, 1000);// debug card
              // show the card
              thisCard.flip();
              // is there some card that was previously selected?
              if(selections.length === 0) { // no?
                  // select and hold the card with face up
                  selections.push(thisCard);
                  thisCard.hold = true;
                  return false;
              } else { // yes?
                  // check for number of cards equals to make a right
                  if (selections.length < turns-1) { // finish move?
                      if (thisCard.name == selections[0].name) { // no? and can continue? yes?
                          // add to selection
                          selections.push(thisCard);
                          thisCard.hold = true;
                      } else { // no? can't continue? the cards are different then
                          // flip selected cards back and canClick for the flip animation finishes to select another card
                          thisCard.hold = false;
                          for (i = 0; i < selections.length; i++) {
                              selections[i].hold = false;                    
                          }                    
                          canClick = false;
                          setTimeout(function() {
                              thisCard.flip();
                              for (i = 0; i < selections.length; i++) {
                                  selections[i].flip();                    
                              }
                              selections.length = 0; // clear selections
                          }, 1500);
                          setTimeout(function() {
                              canClick = true;
                          }, 2301); 
                          return false;
                      }
                      return false;
                  } else if (thisCard.name == selections[0].name) { // yes? and all selections are equal?
                      // yes?
                      // hold the cards face up until the game is over
                      thisCard.done = true;                    
                      thisCard.hold = true;
                      
                      thisCard.found(); // fade out and rotation animation
                      
                      for (i = 0; i < selections.length; i++) {
                          selections[i].done = true;
                          selections[i].hold = true; 
                          selections[i].found();                        
                      }
                      selections.length = 0; // clear selections
                      winCounter--;
                      // all cards are faced up?
                      if(winCounter == 0) { // yes?
                          // so, GG, the game is over. Victory!
                          setTimeout(function() {
                              game.ui.reset();
                              game.ui.alert("Parab&eacute;ns! Jogo conclu&iacute;do! Aperte OK para jogar novamente.", (function() {
                                  setTimeout(function() {
                                      // Restart the game after click ok
                                      restartGame();
                                  }, 700);
                              }));
                          },1200);
                      } // no? so, the game goes on
                      return false;
                  } else { // no? - the cards are different then
                      // flip both cards back and canClick for the flip animation finishes to select another card
                      thisCard.hold = false;
                      for (i = 0; i < selections.length; i++) {
                          selections[i].hold = false;                    
                      }                    
                      canClick = false;
                      setTimeout(function() {
                          thisCard.flip();
                          for (i = 0; i < selections.length; i++) {
                              selections[i].flip();                    
                          }
                          selections.length = 0; // clear selections
                      }, 1500);
                      setTimeout(function() {
                          canClick = true;
                      }, 2310);                    
                  }
              }
          }

          return false;
      }