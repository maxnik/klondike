// Make sure that the $ alias referred to the jQuery name in a localized manner
// without affecting the remainder of the page.
(function ($) {
  var Card = {
    _SUITS: [{symbol: '&diams;', color: 'red'}, 
	     {symbol: '&spades;', color: 'black'}, 
	     {symbol: '&hearts;', color: 'red'},
	     {symbol: '&clubs;', color: 'black'}],
    _RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],    
    _init: function () {
      var index = this.options.index;
      var num_ranks = this._RANKS.length;
      var suit = parseInt(index/num_ranks);
      this._setData('suit', suit);
      this._setData('rank', index - (suit * num_ranks));
      this.element.addClass('container')
	.append('<div class="downturned card">');
    },
    _suit: function () { return this._getData('suit'); },
    _rank: function () { return this._getData('rank'); },
    set_top: function (top) { this.element.css('top', top+'px'); },
    is_downturned: function () { 
      return this.element.children('.downturned').length != 0; 
    },
    droppable_enable: function () { 
      this.element.droppable('enable'); 
    },
    _current_scope: function () { 
      with (this) {
	return _SUITS[_suit()].color + _RANKS[_rank()]; 
      }
    },
    _acceptable_scope: function () {
      with (this) {
	var scope = '';
	scope += (_SUITS[_suit()].color == 'red') ? 'black' : 'red';
	var rank = _rank();
	if (rank == 0) {
	  scope += _RANKS[-1];
	}
	else if (rank == (_RANKS.length-1)) {
	  scope = 'default';
	}
	else {
	  scope += _RANKS[rank-1];
	}
	return scope;	
      }
    },
    upturn: function () {
      with (this) {
	if (is_downturned()) {
	  element.children('.card')
	    .removeClass('downturned').addClass(_SUITS[_suit()].color)
	    .append('<span class="suit right">'+_SUITS[_suit()].symbol+'</span>')
	    .append('<span class="rank left">'+_RANKS[_rank()]+'</span>')
	    .append('<span class="suit left">'+_SUITS[_suit()].symbol+'</span>');
	  element.addClass(_current_scope())
	    .draggable({containment: '#field', 
			revert: 'invalid',
			revertDuration: 200, 
			zIndex: 99})
	    .droppable({hoverClass: 'highlighted',
			accept: '.'+_acceptable_scope(),
			drop: function (event, ui) {
			  var $parent_place = ui.draggable.parent();
			  if ($parent_place.hasClass('tableau')) {
			    //$parent_place.droppable( );
			  } else if ($parent_place.card('is_downturned')) {
			    ui.draggable.parent().card('upturn');
			  } else {
			    ui.draggable.parent().card('droppable_enable');
			  }			
			  var $target = $(this);
			  ui.draggable.css({top: '25px', left: 0});
			  //var target_z_index = new Number($target.children('.card').css('z-index'));
			  //ui.draggable.children('.card').css('z-index', target_z_index + 1);
			  $target.append(ui.draggable);
			  $target.droppable('disable');
			} });
	}
      }      
    }
  };
  $.widget('ui.card', Card); // create the widget
  $.ui.card.getter = "is_downturned";
})(jQuery);

var deck = new Array(52);
var tableau_piles = new Array(7);
var tableau_piles_images = new Array(7);

$(document).ready(function () {
  for (var i = 0; i < deck.length; i++) {
    deck[i] = $('<div>').card({index: i});
  }
  for (var c in deck) {
    var random_index = parseInt(Math.random() * deck.length);
    var temp = deck[c];
    deck[c] = deck[random_index];
    deck[random_index] = temp;
  }
  for (var p = 0; p < tableau_piles.length; p++) {
    tableau_piles[p] = deck.splice(0, p+1);
    tableau_piles[p][tableau_piles[p].length-1].card('upturn'); // upturn the last card in each pile
  }
  for (p = 0; p < tableau_piles_images.length; p++) {
    var $tableau_pile_image = $('<div class="tableau">').css('top', '130px').css('left', (p*70)+100+'px')
				        .css('position', 'absolute').appendTo('#field');
    tableau_piles_images[p] = $tableau_pile_image;
  }
		    
   for (p in tableau_piles) {
     for (c in tableau_piles[p]) {
       var card = tableau_piles[p][c];
       card.card('set_top', 10);
       tableau_piles_images[p].append(card);
       tableau_piles_images[p] = card;
     } 
   }
});

