function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
  this.image = $('<div class="downturned card">');
}
Card.SUITS = [{symbol: '&diams;', color: 'red'}, 
	      {symbol: '&spades;', color: 'black'}, 
	      {symbol: '&hearts;', color: 'red'},
	      {symbol: '&clubs;', color: 'black'}];
Card.RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
Card.prototype.acceptable_scope = function () {
  with (this) {
    var scope = '';
    if (Card.SUITS[suit].color == 'red') 
      scope += 'black'; 
    else 
      scope += 'red';
    if (rank == 0) {
      scope += Card.RANKS[-1];
    }
    else if (rank == (Card.RANKS.length-1)) {
      scope = 'default';
    }
    else {
      scope += Card.RANKS[rank-1];
    }
    return scope;
  }
};
Card.prototype.current_scope = function () {
  return Card.SUITS[this.suit].color + Card.RANKS[this.rank];
};
Card.prototype.upturn = function () {
  with (this) {
    image.removeClass('downturned').addClass(Card.SUITS[suit].color)
      .append('<span class="suit right">'+Card.SUITS[suit].symbol+'</span>')
      .append('<span class="rank left">'+Card.RANKS[rank]+'</span>')
      .append('<span class="suit left">'+Card.SUITS[suit].symbol+'</span>');
  }
};

var deck = new Array();
var tableau_piles = new Array(7);
var tableau_piles_images = new Array(7);

$(document).ready(function () {
  for (var suit in Card.SUITS) {
    for (var rank in Card.RANKS) {
      deck.push(new Card(suit, rank));
    }
  }
  for (var c in deck) {
    var random_index = parseInt(Math.random() * deck.length);
    var temp = deck[c];
    deck[c] = deck[random_index];
    deck[random_index] = temp;
  }
  for (var p = 0; p < tableau_piles.length; p++) {
    tableau_piles[p] = deck.splice(0, p+1);
    tableau_piles[p][tableau_piles[p].length-1].upturn(); // upturn the last card in each pile
  }
  for (p = 0; p < tableau_piles_images.length; p++) {
    var $tableau_pile_image = $('<div>').css('top', '130px').css('left', (p*70)+100+'px')
				        .css('position', 'absolute').appendTo('#field');
    tableau_piles_images[p] = $tableau_pile_image;
  }
  for (p in tableau_piles) {
    for (c in tableau_piles[p]) {
      var $container = $('<div class="container">');
      var card = tableau_piles[p][c]; 
      //card.image.css({'z-index': c+1});
      $container.append(card.image);
      if (! card.image.hasClass('downturned')) {
	$container.addClass(card.current_scope())
	  .draggable({containment: '#field', 
                      revert: 'invalid',
		      revertDuration: 200, 
		      zIndex: 99
		      })
	  .droppable({hoverClass: 'highlighted',
	              accept: '.'+card.acceptable_scope(),
		      drop: function (event, ui) {
			if (ui.draggable.siblings('.card').hasClass('downturned')) {
			  //ui.draggable.siblings('.card').upturn();
			} else {	
			  ui.draggable.parent().droppable('enable');		  
			}			
			var $target = $(this);
			ui.draggable.css({top: '26px', left: 0});
			//var target_z_index = new Number($target.children('.card').css('z-index'));
			//ui.draggable.children('.card').css('z-index', target_z_index + 1);
			$target.append(ui.draggable);
			$target.droppable('disable');
		      }});

      }
      $container.appendTo(tableau_piles_images[p]);
      tableau_piles_images[p] = $container;
    }
  }
});
