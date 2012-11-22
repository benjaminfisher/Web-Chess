/**
 * Master object to control game functionality and contain players and pieces.
 * @author Benjamin Fisher
 * @version 20.5
 * @constructor
 */
function Game() {
    var selectedSquare = null,
        gameOver = false,
        self = this;

	Game.board = $('#board');
	/** Tracks the number of turns taken for move logging */
    Game.turnCount = 1;
    /** {array} to hold the game's players. Players[0] is the current player */
    Game.Players = [];
    /** {boolean} Controls whether to change the turn. Set to true if the current move is legal. */
    Game.change = false;
    /** House keeping variable to track whether a castle took place on the current turn for move logging. */
    Game.castled = null;
    
    Game.cLabels = "ABCDEFGH";
    
	Game.board.find('ul li').click(function(){
		Game.square_click(this);
	});
    
    $('#resign').button().click(function() {
        Game.endGame(1);
    });
    
    Game.$cover = $('#cover');
    
//=======================================================

/**
 * @constructor
 * @class
 * @extends Game
 * @param {string} name The player's name
 * @param {string} side The color of the Player's pieces
 */
	Player = function(){
		var pCount = $(Game.Players).size();
		
        /** Array to hold the Player's pieces */
        this.pieces = [];
        
        /** Array to hold the Player's pawns */
        this.pawns = [];
        
        this.color = (pCount === 0) ? 'white' : 'black';
        
        /** {string} Players name (displayed in the dashboard) */
        this.name = (name) ? name : 'Player ' + (pCount + 1);
        
        // The row where the Player's piece start the game
        // White Player starts on Row 1, Black on row 8
        var startRow = (this.color == 'white') ? 1 : 8,
			// Pawns start on the next medial row
            pawnRow = (this.color == 'white') ? 2 : 7;
            
        this.init(startRow, pawnRow);
	}; // End of Player() definition
    
    Player.prototype = {
		init: function(sRow, pRow){
			for (var p = 0; p <= 7; p++){
				this.addPiece('pawn', Game.cLabels[p] + pRow);
			}

				this.addPiece('rook', "A" + sRow);
				this.addPiece('rook', "H" + sRow);
				this.addPiece('knight', "B" + sRow);
				this.addPiece('knight', "G" + sRow);
				this.addPiece('bishop', "C" + sRow);
				this.addPiece('bishop', "F" + sRow);
				this.addPiece('queen', "D" + sRow);
				this.addPiece('king', "E" + sRow);
			},

		/**
		 * Add the active class to all pieces and pawns of the current player
		 * @author BF
		 */
		activate: function(){
			$('.' + this.color).addClass('active');
		},
      
      /**
       * Create a new piece and add it to the correct array (pawns or pieces) for this player
       * @param [string] type What piece this is (e.g. queen, rook etc.)
       * @param [string] start The starting square address (format: [R]ow [C]olumn) of the piece
       */
		addPiece: function(type, start){
			var newPiece = null;
		
			if (type === 'king') array = false;
			else if (type === 'pawn') array = this.pawns;
			else array = this.pieces;
		
			if (type == 'pawn') newPiece = new pawn(this.color, start);
			else if (type == 'bishop') newPiece = new bishop(this.color, start);
			else if (type == 'knight') newPiece = new knight(this.color, start);
			else if (type == 'rook') newPiece = new rook(this.color, start);
			else if (type == 'queen') newPiece = new queen(this.color, start);
			else this.King = new king(this.color, start);

			if (array) array.push(newPiece);
		}
    };
/*** End of Player() methods ***/

	/**
	 * Parent class of pieces and pawns
	 * @class Represents a chess piece (or pawn)
	 * @extends Game
	 * @param {string} color The color (side) of the Piece
	 * @param {string} start The starting position of the Piece in format [CR]
	 */
	Piece = function(color, start){
		this.moved = false;
		this.protection = false;
		this.position = start;
		this.color = color;
		this.image = $("<img>");
		$(this.image).attr({
			src: 'images/' + this + '_' + color + '.png',
			alt: color + ' ' + this
		})
			.addClass(color)
			.data('piece', this)
			.appendTo("#" + this.position);
	};

	/**
	 * @extends Piece
	 */
    Piece.prototype = {
       _move: function(destination) {
            var occupant = Game.occupied(destination.id),
                self = this,
                square_check = null;
                capturedPiece = null;
                
            // Store the occupant of the destination square.
            $(this.image).appendTo(destination);
            
            if (occupant) capturedPiece = occupant;
            else if (this.EP) capturedPiece = this.EP;
            
            // If a piece is captured, remove the piece
            if (capturedPiece) $(capturedPiece).remove();
            
            square_check = Game.check(Game.Players[0].King.position, Game.Players[1], capturedPiece);
            
            // Check to see if move results in check << B. Fisher 3/07 2030
            if (this.type != 'king' && square_check.threat) {
                $('.legal').removeClass('legal');
                
                // Move it to the place of the piece it's capturing
                $(this.image).appendTo('#' + this.position);
                
                // Capturing would result in check, put the piece back and 'threat' the king's square << B. Fisher
                if (capturedPiece)(capturedPiece.image).appendTo(capturedPiece.position);
                
                $('#' + this.position).removeClass('selected');
                $('#' + Game.Players[0].King.position).addClass('threat');
                
                // Add attach class to any pieces that are threatening the current player's king
				$(square_check).each(function(){
					$('#' + this.position).addClass('attack');
                });
                
                Game.change = false;
            }
            else {
                // The move was valid, carry on with the capture
                var location = this.position;
                this.position = destination.id;
                this.moved = true;
                
                if (capturedPiece) capturedPiece.capture();
                Game.change = true;
                
                if (!(this.type == 'rook' && Game.castled)) Game.logMove(this, location, capturedPiece);
            }
       },
       
       capture: function() {
            this.kill();
            $(this.image).remove();
			
            // Show captured piece in the prison << B. Fisher 3/11 1640
            var cell = $('#prison [rel="' + this.color + ' ' + this.type + '"]'),
            prisoner = $(cell).find('img');
			
			if ($(prisoner).hasClass('hidden')){
				$(prisoner).removeClass('hidden')
				.hide()
				.fadeIn('slow');
			}

            // If the count span is empty, insert '1' and hide it.
            // If it already contains a number, add 1 and show it. << B. Fisher <<3/11 1800
            var cellCount = $(cell).find('.count')[0],
                c = null;
            if ($(cellCount).html()) {
                c = $(cellCount).html();
                c++;
                $(cellCount).html(c).fadeIn('slow');
            }
            else $(cellCount).html(1).hide();
            return true;
       },
       
       /**
        * Evaluate the owner of the piece.
        * @returns [Object] Player
        * @author BF
        */
		owner: function(){
			var player = (Game.Players[0].color === self.color) ? Game.Players[0] : Game.Players[1];
			return player;
		},
	
/**
 * Remove captured or promoted pieces from their Players piece or pawn array.
 * @param piece the piece to be removed
 * @param player the piece's player
 * @param array the appropriate array
 * @param index location of the piece or pawn in the array
 * @author BF
 */
        kill: function() {
			var index,
				player = this.owner(),
				array  = (this.type == 'pawn') ? player.pawns : player.pieces;
                
            index = $.inArray(this, array);

            if (index > -1) array.splice(index, 1);
        },
       
/**
 * @returns {Array} Capturable piece objects
 * @returns {String} .moves comma seperated list of squares where the -child- can legally move.
 * @author BF
 */
		Legal: function () {
			var self = this,
				C = self.position[0],
				cNum = Game.colNumber(C),
				footprint = self.footprint(),
				kid = null,
				legal = [],
				rNum = self.position[1] * 1,
				rook = null,
				squares = null,
				square_check = null,
				dest, orig, path, legalIDs = "";

			var append = function (startString, appendString) {
				if (startString.length > 0 && appendString.length > 0 && startString[startString.length] != ',' && appendString[0] != ',') {
					return startString + ',' + appendString;
				} else return startString + appendString;
			};

			$(footprint).each(function () {
				if (Game.inside(this, self.position)) {
					dest = Game.occupied('#' + this);
					if (self.type == 'knight') {
						// Knights are 'leapers'. They do not move along a vector
						// but jump to the destination square. << B. Fisher
						if (dest.color == self.color) legal.push(dest);
						else legalIDs = append(legalIDs, Game.writeID(this[0], this[1]));
					} else if (self.type == 'pawn') {
						// pawns cannot capture on their own column
						if (dest && C != this[0]) {
							if (dest.color == self.color) legal.push(dest);
							else legalIDs = append(legalIDs, Game.writeID(this[0], this[1]));
						}
						// Check for a pawn in EP and whether its column matches the move
						else if (self.EP && self.EP.position[0] == this[0]) {
							legalIDs = append(legalIDs, Game.writeID(this[0], this[1]));
						}
						// add vertical moves
						else if (C == this[0]) {
							legalIDs = append(legalIDs, Game.vector(self.position, this, self.color).list);
						}
					} else {
						path = Game.vector(self.position, this, self.color, true);
						// add squares in current vector to legal moves list
						legalIDs = append(legalIDs, path.list);
						// add vulnerable opposing pieces to legal Array
						legal.push(path.end);
					}
				}
			});

			// King move legality.
			if (self.type == 'king') {
				// Check for castle legality and add king double step if true. << B. Fisher
				if (self.castle()) {
					rook = Game.occupied('#H' + rNum);

					// Kingside castle squares are unoccupied and unthreatened,
					// and the kingside rook has not moved.
					if (Game.vector(self.position, 'G' + rNum, self.color).list.match('G') && rook && !rook.moved && !Game.check('F' + rNum, Game.Players[1]).threat) {
						legalIDs = append(legalIDs, Game.writeID('G', rNum));
					}

					// Queenside squares between rook and king are not occupied.
					// The king is not moving across check.
					// and the queenside rook has not moved.
					rook = Game.occupied('#A' + rNum);
					if (Game.vector(self.position, 'B' + rNum, self.color).list.match('B') && rook && !rook.moved && !Game.check('D' + rNum, Game.Players[1]).threat) {
						legalIDs = append(legalIDs, Game.writeID('C', rNum));
					}
				} // End Castle legality checks

				console.log("Squares:" + squares);

				// Removes any square ids from legalIDs that would move the king into check << B. Fisher 3.04 1700
				squares = legalIDs.split(',');

				console.log(legalIDs.split(','));
				console.log(this.type, this.color, "Legal IDs:" + legalIDs, "Squares:" + squares);

				for (var i = squares.length - 2; i >= 0; i--) {
					kid = Game.occupied(squares[i]);
					square_check = Game.check(squares[i], Game.Players[1]);

					// if square is occupied by a piece of opposing color, check for protection
					// if protected add .threat class and remove location from legal moves
					if (kid.color == Game.Players[1].color) {
						if (square_check.protect) {
							$(squares[i]).addClass('threat');
						}
					}

					// if square is threatened by an opposing piece add .threat class
					// and remove from legal moves
					if (square_check.threat) {
						$(squares[i]).addClass('threat');
					}

					if (kid && (kid.type === 'bishop' || kid.type === 'rook')) {
						self.penetration('#' + self.position, kid);
					}
					for (var s in square_check) if (square_check[s].type) {
						self.penetration(squares[i], square_check[s]);
					}
				}

				// Remove threatened squares discovered by penetration from legal list
				$('.threat').each(function () {
					squares.splice(squares.indexOf('#' + this.id), 1);
				});

				legalIDs = squares.join(',');
			} // === End King legality checks === //

			legal['moves'] = legalIDs;

			return legal;
		}, // === End of Legal() === //
		
		
		penetration : function(square, attacker){
			var col = square[1],
				row = square[2]*1,
				acol = attacker.position[0],
				arow = attacker.position[1]*1,
				kcol = this.position[0],
				krow = this.position[1]*1,
				inc = null,
				hole = null;
			
			// Horizontal penetration
			if (attacker.type === 'rook' || attacker.type === 'queen') {
				if (row === krow && krow === arow) {
					if (Game.findInc(acol, kcol) === 1){
						hole = $('#' + this.position).next();
					} else {
						hole = $('#' + this.position).prev();
					}
				}
				
				// Vertical penetration
				if (col === kcol && kcol === acol){
					inc = Game.findInc(arow, krow);
					hole = $('#' + kcol + (krow + inc));
				}
			}
			
			// Diagonal penetration
			if (attacker.type === 'bishop' || attacker.type === 'queen'){
				xChange = Math.abs(Game.colNumber(kcol) - Game.colNumber(acol));
				yChange = Math.abs(krow - arow);
				if(xChange === yChange){
					hole = $('#' + Game.cLabels[Game.colNumber(kcol) +
					Game.findInc(acol, kcol)] +
					(krow + Game.findInc(arow, krow)));
				}
			}
			
			// If opposing piece is in the hole it is protected from capture by the king.
			if (hole && (hole.children('img').length === 0 || hole.children('img').data().piece.color != this.color)){
				hole.addClass('threat');
			}
		} // End penetration
   }; // === End of Piece prototype methods === //
	
/*** Start piece definitions ***/

/**
 * @author BF
 * @constructor
 * @member Piece.prototype
 * @param {string} color The pawn's color
 * @param {string} start Starting square of the pawn in format [CR]
 */
    function pawn(color, start) {
        Piece.call(this, color, start);

        this.type = "pawn";
        this.EP = false;
        
        /** indicates which direction is forward depending on color. */
        this.inc = (color == 'white') ? 1 : -1;
        this.promotion = null;
        this.logCell = null;
        
        /** the promotion rank for the pawn */
        this.endRow = (color == 'white') ? 8 : 1;
    }
    pawn.prototype = new Piece();
    
	pawn.prototype.toString = function(){ return 'pawn';};
	
	pawn.prototype.footprint = function () {
		self = this;
		
		var row = self.position[1] * 1,
			col = self.position[0],
			ids = [];
        
        if (!self.moved) ids.push(col + (row + 2 * this.inc));
        else ids.push(col + (row + 1 * this.inc));
        ids.push(Game.cLabels[Game.colNumber(col) - 1] + (row + this.inc));
        ids.push(Game.cLabels[Game.colNumber(col) + 1] + (row + this.inc));
        return ids;
	};
	
	pawn.prototype.move = function(destination) {
		self = this;
		var col = this.position[0],
			row = this.position[1];
		
        // Evaluate whether pawn has passed an opponent pawn on opening double step << B. Fisher
        if (!this.moved && (destination.id.match(4) || destination.id.match(5))) {
            var prev = (col == 'A') ? false : Game.occupied(destination.previousElementSibling.id);
            var next = (col == 'H') ? false : Game.occupied(destination.nextElementSibling.id);
            if (prev && prev == 'pawn' && prev.color != self.color) prev.EP = this;
            if (next && next == 'pawn' && next.color != self.color) next.EP = this;
        }
        // Check if pawn is capturing en passant. EP variable will hold an opponent pawn that passed.
        // If opponent pawn and this pawn are not on the same column (position[0]) clear EP variable. << B. Fisher
        if (this.EP && this.EP.position[0] != destination.id[0]) this.EP = false;
        
        this._move.call(this, destination);

        if (this.position[1] == this.endRow) this.promote(destination);
	};
	
/**
 * Pawn promotion functionality
 * @method pawn.prototype
 * @author BF
 * @since 3/06/10
 */
	pawn.prototype.promote = function(destination) {
		self = this;
		bench = $('<div>');
		logCell = self.logCell;
		
		bench.attr('id', 'bench');
		
		$('<p>Select a piece for promotion: </p>').appendTo(bench);
		$('<img>')
			.attr('src', 'images/thumb/knight_' + this.color + '_thumb.png')
			.attr('rel', 'knight')
			.appendTo(bench);
		$('<img>')
			.attr('src', 'images/thumb/queen_' + this.color + '_thumb.png')
			.attr('rel', 'queen')
			.appendTo(bench);
		
		bench.appendTo(Game.$cover);
		Game.$cover.fadeIn();
		
		// Place the promotion piece, add it to the pieces array and append the promotion
        // to the logged move. << B. Fisher 3/29 1630
		$(bench).children('img').click(function(){
			$(this).fadeTo('slow', 0.6).fadeTo('fast', 1).delay(1000);
			
			if ($(this).attr('rel') == 'queen') {
				self.owner().addPiece('queen', destination.id);
				$(logCell).html($(logCell).html() + '=Q');
			} else {
				self.owner().addPiece('knight', destination.id);
				$(logCell).html($(logCell).html() + '=N');
			}
			
			Game.$cover.children().remove();
			Game.$cover.fadeOut();
			Game.turn();
		});
        
        // Remove the pawn's image, and clear it from the Player's pieces array.
        $(self.image).remove();
        Game.clearClass();
        // Hold turn change. will be called after a new piece is selected.
        Game.change = false;
        self.kill();
	};
	
/**
 * @author BF
 * @constructor
 * @member Piece.prototype
 */
    function rook(color, start){
        Piece.call(this, color, start);
        this.type = "rook";
    }
    
    rook.prototype = new Piece();
    
    rook.prototype.toString = function() { return 'rook'; };
    
	rook.prototype.move = function(destination) {
		this._move(destination);
	};
    
    rook.prototype.footprint = function(){
		var row = this.position[1],
			col = this.position[0];

        return ['A' + row, 'H' + row, col + 1, col + 8];
	};
	
/**
 * @author BF
 * @constructor
 * @member Piece.prototype
 */
    function knight(color, start) {
        Piece.call(this, color, start);
        this.type = "knight";
	}
    knight.prototype = new Piece();
    
    knight.prototype.toString = function() { return 'knight'; };
    
	knight.prototype.move = function(destination) {
		this._move(destination);
    };
    
    knight.prototype.footprint = function() {
        var ids = [],
            col = Game.colNumber(this.position[0]),
            row = this.position[1] * 1,
            cShift;
            
        for (var r = row - 2; r <= row + 2; r++) {
            if (r != row) {
                cShift = (Math.abs(row - r) == 1) ? cShift = 2 : cShift = 1;
                ids.push(Game.cLabels[col + cShift] + r);
                ids.push(Game.cLabels[col - cShift] + r);
            }
        }
        return ids;
   };

/**
 * @author BF
 * @constructor
 * @member Piece.prototype
 */
    function bishop(color, start) {
        Piece.call(this, color, start);
        
        this.type = "bishop";
	}
	bishop.prototype = new Piece();
    
    bishop.prototype.toString =function() { return 'bishop'; };
    
	bishop.prototype.move = function(destination) {
		this._move(destination);
    };
    
	bishop.prototype.footprint = function() {
		return [ Game.findDiagonal(this.position, 1, 1), Game.findDiagonal(this.position, 1, -1),
			Game.findDiagonal(this.position, -1, 1), Game.findDiagonal(this.position, -1, -1)];
	};

/**
 * @author BF
 * @constructor
 * @member Piece.prototype
 */
    function queen(color, start) {
        Piece.call(this, color, start);
        this.type = "queen";
    }
    queen.prototype = new Piece();
    
    queen.prototype.toString = function() { return 'queen'; };
    
    queen.prototype.move = function(destination){ this._move(destination); };
    
    queen.prototype.footprint = function(){
		var row = this.position[1],
			col = this.position[0];
			
        return ['A' + row, 'H' + row, col + 1, col + 8,
			Game.findDiagonal(this.position, 1, 1), Game.findDiagonal(this.position, 1, -1),
			Game.findDiagonal(this.position, -1, 1), Game.findDiagonal(this.position, -1, -1)];
    };

/**
 * @author BF
 * @constructor
 * @member Piece.prototype
 */
    function king(color, start) {
        Piece.call(this, color, start);
        
        this.type = "king";
        this.inCheck = false;
    }
	king.prototype = new Piece();
    
	king.prototype.toString = function() { return 'king'; };
    
	king.prototype.move = function(destination){
		var rook = null,
			dest = null;

		// Evaluate if king is castling. << B. Fisher
		if (this.castle() && (destination.id.match('G') || destination.id.match('C'))) {

		// If king is moving to column 'G' (kingside) rook is on column 'H'
	    if (destination.id.match('G')) {
	        rook = Game.occupied('H' + this.position[1]);
	        dest = destination.previousElementSibling;
	        Game.castled = "king";
	    }
	    
	    // If king is moving to column 'C' (queenside) rook is on column 'A'
	    else if (destination.id.match('C')) {
	        rook = Game.occupied('A' + this.position[1]);
	        dest = destination.nextElementSibling;
	        Game.castled = "queen";
	    }
	    // Move the king, than move the rook to the king's other side (dest). << B. Fisher
	    this._move(destination);
	    $(rook.image).fadeOut('fast', function() {
	        rook.move(dest);
	        $(rook.image).fadeIn('fast');
	        
	        // Reset the castled to false so black's moves will be logged << J-M Glenn
	    	Game.castled = null;
	    });
		}
		else this._move(destination);
       }
       
		king.prototype.castle = function() {
			if (this.inCheck || this.moved) return false;
			else return true;
		}
       
       king.prototype.footprint = function() {
        var row = this.position[1] * 1,
            column = Game.colNumber(this.position[0]),
            square, squares = new Array();
            
        for (var c = column - 1; c <= column + 1; c++) {
            for (var r = row - 1; r <= row + 1; r++) {
                square = Game.cLabels[c] + r;
                if (square != this.position) squares.push(square);
            };
        };
        return squares;
    }
    // End piece definitions

    self.init();
    return false;
};

Game.prototype = {
	init: function(){
		var names = this.get_player_names();
		
		$('button').button();
		
		Game.Players.push(new Player());
		Game.Players.push(new Player());
		Game.Players[0].activate();
		
		$('#turn').html(Game.Players[0].name);
	},
	
	get_player_names: function(){
		Game.$cover.fadeIn();
		
		form = $('<form><h1>Welcome to Web Chess</h1>' +
				'<h2>Enter player\'s names</h2>' +
				'<div><label for="Player1">Player 1</label>' + 
				'<input id="Player1" placeholder="White..." name="Player1"><br />' +
				'<label for="Player2">Player 2</label>' +
				'<input id="Player2" placeholder="Black..." name="Player2"></div>' +
				'<br /><button type="submit">Submit</button>');
				
		$(form).submit($.proxy(function(event){
			event.preventDefault();
			
			var names = [$('#Player1').val(), $('#Player2').val()];
			
			if (!names[0]) names[0] = 'Player 1';
			if (!names[1]) names[1] = 'Player 2';
			
			Game.Players[0].name = names[0];
			Game.Players[1].name = names[1];
			
			form.remove();
			
			$('#turn').html(Game.Players[0].name);
			Game.$cover.fadeOut();
			$('#Dash').removeClass('hidden').hide().fadeIn('slow');
			
		},this));
		
		$(form).appendTo(Game.$cover);
		$('#Player1').focus();
	}
};

Game.callPiece = function(image) {
	if (image) return $(image).data().piece;
	else return false;
}

/**
 * @param square [string] Format is 'RC' where R = row and C = column. The location of the threatened piece (usually a king)
 * @param player [player] The opposing player. Player's piece and pawn moves are iterated for threats to the square.
 * @param ignore [piece] It can be used to prevent recursion in the Legal object, helps in pinning checks.
 * @return [Object] array of pieces that are threatening the square location.
 * @return [boolean] .protect whether piece occupying square is guarded by a piece of the same color
 * @return [boolean] .threat whether the square is threatened by an opposing piece
 * @author BF
 */
Game.check = function(square, player, ignore) {
    var chk = new Array(),
        ids, footprint, legal;
        
    chk.protect = false;
    chk.threat = false;
    
	// Interate through player's pieces to evaluate threats
    $(player.pieces).each(function() {
        if (this != ignore) {
        	legal = this.Legal();
        	if ($.inArray(Game.occupied(square), legal) >= 0) {
        		chk.protect = true;
        	};
            ids = legal.moves

            if (ids.length > 0 && ids.match(square)) chk.push(this);
        };
    });
    
    // Evaluate player's pawn capture squares. << B. Fisher 3/14 2130
    $(player.pawns).each(function() {
        var pawn = this;
        if (ignore != pawn) {
            ids = pawn.footprint();
            $(ids).each(function(index) {
            	//remove non-capture moves from footprint list
                if (this[0] == pawn.position[0]) ids.splice(index, 1);
            });
            if ($.inArray(Game.hash_check(square), ids) >= 0) {
            	kid = Game.occupied(square);
            	if (kid.color === pawn.color) chk.protect = true;
                chk.push(pawn);
            };
        };
    });
    
    ids = player.King.footprint();
    if ($.inArray(square.substring(1), ids) >= 0) chk.push(player.King);
    if (chk.length >= 1) chk.threat = true;
    
    return chk;
};

Game.colNumber = function(column)  {
	return "ABCDEFGH".indexOf(column);
};


Game.Checkmate = function() {
	var player = this.Players[0],
		check = Game.check(player.King.position, this.Players[1]);
	
	var transpose = function (){
		var squares = Game.vector(player.King.position, check[0].position, player.color).list.split(',');
		
		console.log(squares);

	};
    //if players king is in check
    if (player.King.inCheck) {    	
    	// if all available moves for the king are threatened
    	if(player.King.Legal().moves.length === 0){
    		// if checking piece is vulnerable
    		if(check.length === 1 && Game.check(check[0].position, player).threat){
    			return false;
    		
    		// if transposition of check is possible
    		} else if (transpose()) {
    			return false
    		} else {return true};
    	};
    }
    
    return false;
} // End of Checkmate()

Game.clearClass = function(){
	// legal moves of previously selected piece cleared
    $('.legal').removeClass('legal');
    // previously selected piece cleared
    $('.selected').removeClass('selected');
    // threatened squares within kings footprint cleared
    $('.threat').removeClass('threat');
    // display of pieces threatining the king directly are cleared
    $('.attack').removeClass('attack');
}

Game.endGame = function(gameOver) {
	$note = $('<div>');
	
	$('<h1>').html('Web Chess').appendTo($note);
	
    // End game alerts << B. Fisher
    switch (gameOver) {
    	
    // Resignation case
    case 1:
    	$('<p>')
    		.html(Game.Players[0].name + ' resigned on turn ' + Game.turnCount + '.')
    		.appendTo($note);
        break;
        
    // Checkmate case
    case 2:
        $('<p>')
        	.html(Game.Players[0].name + ' was mated after ' + Game.turnCount + ' moves.')
        	.appendTo($note);
        break;
        
   	// Stalemate case
    case 3:
        $('<p>')
        	.html(Game.Players[0].name + ' is in Stalemate after ' + Game.turnCount + ' moves.')
        	.appendTo($note);
        break;
        
        // If gameOver is false then proceed with next players turn.
    default:
        $('#Dash').css('background', Game.Players[0].color);
        $('#turn').html(Game.Players[0].name);
        //			$("#board img." + Game.Players[0].color).draggable("enable");
    }
	
	$note.appendTo(Game.$cover);
	
    Game.$cover.slideDown('slow');
    $('button').button('disable');
} // End of endGame()

/**
 * Simple function to return a comparison between [first] and [second] 
 * Returns: 1 if greater than, Returns: -1 if less than, Returns: 0 if equal.
 * @author BF
 */
Game.findInc = function(first, second) {
    var Inc;
    if (first > second) {
        Inc = -1
    }
    else if (first < second) {
        Inc = 1
    }
    else {
        Inc = 0
    };
    return Inc;
}
    
/**
 * Returns: the ID of the farthest diagonal square on the board from [start] (requires ID, not object)
 * given X and Y increments.
 * @author BF
 */
Game.findDiagonal = function(start, xInc, yInc) {
    var x = "ABCDEFGH".indexOf(start[0]),
        y = start[1] * 1;
    do {
        x += xInc;
        y += yInc;
    }
    while (x > 0 && x < 7 && y > 1 && y < 8);
    if (x < 0 || x > 7 || y < 1 || y > 8) {
        return
    };
    
    return ("ABCDEFGH"[x] + y);
}

/**
 * function to strip '#' from a square address
 */
Game.hash_check = function(x){
	y = (x[0] === '#') ? x.substring(1) : x;
	return y;
}

/**
 * Checks that square is valid and not equal to origin, and its coordinates are inside the board. 
 * housekeeping function for Legal.
 * @author BF
 */
Game.inside = function(square, origin) {
    if (square && origin != square && square[1]*1 >= 1 && square.substr(1)*1 <= 8 && 
    	Game.colNumber(square[0]) >= 0) {
    	return true;
    }
    else {
    	return false;
	}
}

/**
 * Log the player's move
 * @author J-M Glenn, Modified << B. Fisher 3/23 1830
 * @param {object} piece The piece that moved
 * @param {string} start The starting square of piece format [CR]
 * @param {boolean} captured Whether move resulted in a capture
 */
Game.logMove = function(piece, start, captured) {
    var row = $('<tr>'),
        cell, end = piece.position.toLowerCase(),
        moveType = (captured === null) ? " - " : " x ",
        pieceType = (piece.type != "knight") ? piece.type.toUpperCase().charAt(0) : "N",
        move;
    start = start.toLowerCase();
    $('#log').attr({
        scrollTop: $('#log').attr('scrollHeight')
    });
    if (piece.color == "white") {
        $(row).append('<td>').append('<td>').append('<td>').appendTo('#log tbody');
        $(row).children().first().text(Game.turnCount + '.');
        $(row).children().last().hide();
        cell = $(row).children()[1];
    }
    else {
        cell = $('#log tbody td:last');
        $(cell).show();
    }
    if (Game.castled == "king") move = '0-0';
    else if (Game.castled == "queen") {
        move = ('0-0-0');
    }
    else {
        pieceType = (pieceType != "P") ? pieceType : '';
        move = (pieceType + start + moveType + end);
    }
    // If a pawn is promoting store the cell where the move is logged to append with promotion info << B. Fisher
    if (piece.type == 'pawn' && piece.position[1]*1 == piece.endRow) piece.logCell = cell;
    $(cell).text(move);
}

/** Checks the square ID for a occupying piece.
 * @author BF
 * @returns If square is occupied return the piece, else return false
 */
Game.occupied = function(ID) {
	var kid = null;
	
    if (typeof(ID) != 'string') return false;
    
    if (ID.match('#') <= 0) ID = '#' + ID;
    
    kid = $(ID).children('img');
    if (kid.length > 0) {
        kid = kid[0];
        return Game.callPiece(kid);
    }
    else {
        return false;
    }
}
    
Game.square_click = function(square){
	var kid = Game.occupied(square.id);
		$square = $(square);
	
	// checks if piece belongs to the current player
    if (kid && kid.color == Game.Players[0].color) {
        Game.select(square);
        $(kid.Legal().moves).addClass('legal');
    }
    // If clicked square is a legal move
    else if ($square.hasClass('legal')) {
    	// retrieve piece from the selected square
        piece = Game.occupied(selectedSquare.id);
        piece.move(square);
        
        // If the last move did not result in check call the turn change. << B. Fisher
        if (Game.change) this.turn();
    }
    // if square is not occupied, or is occupied by a piece that is not capturable than clear the selection.
    else {
        Game.select(false);
    }
}

/**
 * Function to handle square selection.
 * Previously selected squares (and any dependant classes) are cleared.
 * If a square id is passed the square is given the selected class.
 * If a falsey value is passed than the global variable 'selectedSquare' is cleared.
 * @param [HTML object] The li containing the clicked piece
 * @author BF
 */
Game.select = function(square) {
	Game.clearClass();
    
    if (square) {
        selectedSquare = square;
        $(selectedSquare).addClass('selected');
    }
    else { selectedSquare = null; }
} // === End of select() ===//

/**
 * @returns [boolean] true = current player's king is not in check but player has no legal moves. Else returns false.
 * @author BF
 */
Game.Stalemate = function() {
    var legalMoves = '';
    
    $.each(Game.Players[0].pieces, function() {
        legalMoves += this.Legal().moves;
    });
    
    $.each(Game.Players[0].pawns, function() {
        legalMoves += this.Legal().moves;
    });
    
    legalMoves += Game.Players[0].King.Legal().moves;
    
    if (legalMoves.length === 0 && !Game.Players[0].King.inCheck) return true;
    else return false;
} // End of Stalemate()

/**
 * Manages turn change.
 * 1. Is next player in check
 * 2. Clear EP variables for current player's pawns
 * 3. Switch active player and activate all of their pieces
 * 4. Incriment turncount if current player is white
 * 5. Clear the change variable
 * 6. Checkmate
 * 7. Stalemate
 * 8. Update dash with current player name and color
 * 9. Show if current player is threatened
 */
Game.turn = function(){
    this.select(false);
    
    Game.clearClass();
    /** Find whether the last move placed the next player in check **/
    Game.Players[1].King.inCheck = this.check(Game.Players[1].King.position, Game.Players[0]).threat;
    
    /** Clears the EP variables of the current players pawns << B. Fisher **/
    $(Game.Players[0].pawns).each(function() {
        this.EP = false;
    });
    
    $('.active').removeClass('active');
    // Switches the active player
    Game.Players.reverse();
    Game.Players[0].activate();
    
    if (Game.Players[0].color == 'white') { //Each time both players have moved turnCount incriments <<B. Fisher
        Game.turnCount++;
    }
    Game.change = null;
    
    if (this.Checkmate()) this.endGame(2);
    if (this.Stalemate()) this.endGame(3);
    
    // Game didn't end, change name and color of dash
    $('#Dash').css('background', Game.Players[0].color);
    $('#turn').html(Game.Players[0].name);
    $('.threat').removeClass('threat');
    
    /** Display if current Player's king is threatened **/
    if (Game.Players[0].King.inCheck) $('#' + Game.Players[0].King.position).addClass("threat");
    
} // === End of turn() ===//

/**
 * @author BF
 * @param start the pieces location
 * @param end the final square along the given path
 * @param side current player's color
 * @param [capture] {boolean} whether opposing pieces can be captured on the last square
 * @returns [string] list = comma seperated square ids for the requested vector, continuing to an occupied square.
 * @returns [piece] end = occupant of end square
 * if the square is occupied by an opponent piece the vector ids includes that square unless capture is false.
 */
Game.vector = function(start, end, side, capture){
    var sX = Game.colNumber(start[0]),
        eX = Game.colNumber(end[0]),
        sY = start[1] * 1,
        eY = end[1] * 1,
        xInc = Game.findInc(sX, eX),
        yInc = Game.findInc(sY, eY),
        squareList = '',
        capture = capture || false, // default capture to false
        dest, piece, square;
        
    do {
        sX += xInc;
        sY += yInc;
        square = Game.cLabels[sX] + sY;
        dest = this.occupied('#' + square);
        if (dest) {
            if (capture && dest.color != side) squareList += (squareList.length > 0) ? ',#' + square : '#' + square;
            else if (dest.color == side) piece = dest;
            break;
        };
        squareList += (squareList.length > 0) ? ',#' + square : '#' + square;
    }
    while ((Game.cLabels[sX] + sY) != end);
    
    return {
        list: squareList,
        end: piece
    };
}

/**
 * @returns a properly formatted CSS square ID (for jQuery selection) unless the row and/or column are beyound the edge of the board.
 * @author BF
 */
Game.writeID = function(column, row) {
    try {
        if (!column) throw 0;
        else if (!row) throw 1;
        else if (row < 0) throw 2;
        else if (row > 8) throw 3;
    }
    catch (error) {
        if (error == 0) alert('Square ID Error: column is not defined');
        else if (error == 1) console.log('Square ID Error: row is not defined');
        else if (error == 2) console.log('Square ID Error: row is less than board index');
        else if (error == 3) console.log('Square ID Error: row is greater than board index');
    }
    return '#' + column + row;
}