// Make sure that the $ alias referred to the jQuery name in a localized manner
// without affecting the remainder of the page.
var DROPPABLE_OPTIONS = {hoverClass: 'highlighted', 
			 drop: function (event, ui) { 
			   ui.draggable.card('dropped_on', $(this)); 
			 }
			};

(function ($) {
  var Card = {
    _SUITS: [{symbol: 'diams', color: 'red'}, 
	     {symbol: 'spades', color: 'black'}, 
	     {symbol: 'hearts', color: 'red'},
	     {symbol: 'clubs', color: 'black'}],
    _RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    _init: function () {
      var index = this.options.index;
      var num_ranks = this._RANKS.length;
      var suit = parseInt(index/num_ranks);
      this._setData('suit', suit);
      this._setData('rank', index - (suit * num_ranks));
      this.element.addClass('container')
	.append('<div class="downturned">');
    },
    _suit: function () { return this._getData('suit'); },
    _rank: function () { return this._getData('rank'); },
    set_top: function (top) { this.element.css('top', top+'px'); },
    is_downturned: function () { 
      return this.element.children('.downturned').length != 0; 
    },
    _scope: function () { 
      with (this) {
	return _SUITS[_suit()].color+_RANKS[_rank()] + ' ' + 
	       _SUITS[_suit()].symbol+_RANKS[_rank()]; 
      }
    },
    _tableau_pile_scope: function () {
      with (this) {
	var scope = '.';
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
    _foundation_scope: function () {
      with (this) {
	var scope = '.'+_SUITS[_suit()].symbol;
	var rank = _rank();
	if (rank == (_RANKS.length-1)) {
	  scope += _RANKS[0];
	} else {
	  scope += _RANKS[rank+1];
	}
	return scope;
      }
    },
    upturn: function () {
      with (this) {
	if (is_downturned()) {
	  element.children('.downturned')
	    .removeClass('downturned').addClass(_SUITS[_suit()].color)
	    .append('<span class="suit right">&'+_SUITS[_suit()].symbol+';</span>')
	    .append('<span class="rank left">'+_RANKS[_rank()]+'</span>')
	    .append('<span class="suit left">&'+_SUITS[_suit()].symbol+';</span>');
	  element.addClass(_scope());
	  if (element.hasClass('ui-draggable-disabled')) {
	    element.draggable('enable');
	  } else {
	    element.draggable({containment: '#field', 
			       revert: 'invalid',
			       revertDuration: 200, 
			       zIndex: 99});
	  }
	  if (! element.hasClass('ui-droppable-disabled')) {
	    element.droppable($.extend(DROPPABLE_OPTIONS, {accept: _tableau_pile_scope()}));	    
	  }
	}
      }
    },
    downturn: function () {
      this.element.children('.red, .black').empty().removeClass('red').removeClass('black').addClass('downturned');
      this.element.draggable('disable').droppable('disable');
    },
    dropped_on: function ($target) {
      with (this) {
	var $parent_place = element.parent();
	if ($parent_place.hasClass('tableau-pile')) {
	  if ($parent_place.hasClass('ui-droppable-disabled')) {
	    $parent_place.droppable('enable');
	  } else {
	    $parent_place.droppable($.extend(DROPPABLE_OPTIONS, {accept: '.blackK, .redK'}));
	  }
	} else if ($parent_place.card('is_downturned')) {
	  $parent_place.card('upturn');
	} else {
	  $parent_place.droppable('enable');
	}
	element.css({left: '0px'}); // hack hack hack
	if ($target.parents('.tableau-pile').length != 0) {
	  set_top(25);
	} else {
	  set_top(0);
	}
	$target.append(element);
	$target.droppable('disable');
	if ($target.hasClass('foundation') || $target.parents('.foundation').length != 0) {
	  element.droppable('option', 'accept', _foundation_scope());
	} else {
	  element.droppable('option', 'accept', _tableau_pile_scope());
	}
	element.droppable('enable');
      }
    }
  };
  $.widget('ui.card', Card); // create the widget
  $.ui.card.getter = "is_downturned";
   
})(jQuery);

var deck = new Array(52);
var tableau_piles = new Array(7);

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

  var $tableau_piles = $('.tableau-pile');
  var tableau_pile_tops = new Array($tableau_piles.length);
  for (p = 0; p < $tableau_piles.length; p++) {
    $tableau_piles.eq(p).css({top: '140px', left: (p*70)+100+'px'});
    tableau_pile_tops[p] = $tableau_piles.eq(p);
  }

  var $foundations = $('.foundation');
  for (var f = 0; f < $foundations.length; f++) {
    $foundations.eq(f).css({top: '25px', left: (f*70)+310+'px'});
  }
		    
  for (p in tableau_piles) {
    for (c in tableau_piles[p]) {
      var card = tableau_piles[p][c];
      if (c > 0) {
	card.card('set_top', 10);
      }
      tableau_pile_tops[p].append(card);
      tableau_pile_tops[p] = card;
    } 
  }
  
  var $waste = $('#waste');
  var $stock = $('#stock');

  for (c in deck) {
    $stock.append(deck[c]);
  }
  
  $stock.click(function () {
    if ($stock.html() == '') {
      $waste.children('.container').card('downturn').appendTo($stock);
    } else {
      $waste.append($stock.children('.container:first').card('upturn').droppable('disable'));
      if ($stock.html() == '') 
	$stock.removeClass('downturned');
    }    
  });
  
  $('.foundation').droppable($.extend(DROPPABLE_OPTIONS, {accept: '.redA, .blackA'}));

});

