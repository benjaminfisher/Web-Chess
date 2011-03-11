/**
 * @author Benjamin Fisher
 * @date January 2011
 * 
 * version 12 - All pieces but king are moving legally except en Passant capture. Footprint function added to pieces.
 * v12.1 - Added basic king moves, still needs castle functionality & legality.
 * v12.2 - Added castle legality & functionality, rook moves but looses its data
 * v12.3 - Corrected rook issues when castling
 * ^^^ B. Fisher ^^^
 * v13 - Revised CSS. Added marble background with opacity on the squares. << B. Fisher
 * 
 * v13.1 - Added and corrected En Passant << J-M Glenn
 *
 * v13.3 - Removed the Player object from the Game object. Creating a Player sets up its pieces.
 * 			Set Players as a global var. Turn changes reverses the Players array. << B. Fisher
 * 
 * v13.2 - Fixed En Passant and implemented enPassant() function << J-M Glenn
 *  
 * v13.4 - En Passant capture is fully functional including clearing the pawns EP variables at the end
 * 			of the current player's turn. << B. Fisher 2/28 2100
 * 
 * v13.5 - check function passed initial testing. Captured pieces need to be removed 
 * 			from Player pieces array << B. Fisher 3/1 0330
 * 
 * v14.3 - Moved capture functionality to the Player object. Pieces are now removed from the array on capture.
 * 			Check function is working. Added Checkmate (comments only) and Stalemate function (untested). << B. Fisher 3/03 2200
 * 
 * v14.4 - Modified check function to return checking pieces. << B. Fisher 3/04 0300
 * 
 * v14.5 - Added skipKing option to the check function to prevent recursion over the Legal function.
 * 			Legal is removing threatened squares from the kings legal moves. Still doesn't recognize protected pieces.
 * 			Started adding movePiece functionality into the Piece.move() function. << B. Fisher 3/04 1930
 * 
 * v15   - Removed the movePiece function. All piece movement is now handled by the individual piece objects
 * 			and the Piece class. Revamped the Legality function to handle pawn capture and en passant legality.
 * 			also disabled piece drag and drop due to issues with turn changes. << B. Fisher 3/05 2310
 * 
 * v15.1 - Added pawn promotion << B. Fisher 3/06 0230
 * 
 * v15.2 - Corrected issue with piece removal from pieces array on capture << B. Fisher 3/06 0430
 * 
 * v15.3 - Added pinning check to Piece._move function. Detachs the piece and runs check before moving the piece.
 * 			Still doesn't work fully, as the piece should still be able to move within the pinning vector << B. Fisher 3/07 2100
 * 
 * v15.4 - Resolved pinned against king issues except when the pinning piece captures the pinner << B. Fisher 3/07 2115
 * 
 * v15.5 - Still working on pinned against king issues. Pinning piece can move if not resulting in check. King in check isn't able to move
 * 			except to take the checking piece due to recursion issues with Legal and check functions. << B. Fisher 3/10 0500
 * 
 * v16   - Added resign button with gameOver and turnCount variables. << B. Fisher 3/10 1800
 * 
 * Tasks to complete: Correct the following issues with King moves under check: 1) King can capture protected pieces
 * 						2) Checked King is able to move to squares in the checking pieces vector that are behind itself
 * 							for example: King @ G8, Rook on 8th row, King can still move to H8.
 * 					
 * 						Resolve issus with piece movement when pinned against the king
 * 						Code out the Checkmate function.
 * 						Debug the Stalemate function
 * 						Add move list and captured pieces to the dashboard
 * 						Ask for player names at the beginning of the game, and show them in the dashboard
 */

var cLabels = "ABCDEFGH", Players = [], change = false;

function Game(){
	var self = this,
	pieces,
	board = $('#board'),
	squares = $('#board ul li'),
	selectedSquare = null,
	gameOver = false,
	turnCount = 1;
	
	Players = [new Player('white'), new Player('black')];
	
	$('#resign')
		.button()
		.click(function(){
			gameOver = true;
			turn();
		});
	
	function turn(){
		select(false);
		$(pieces).draggable("disable");		// disables piece dragging for previous player
		$('.legal').removeClass('legal');	// clears legal moves of last moved piece
		
		//Clears the EP variables of the current players pawns << B. Fisher
		$(Players[0].pieces).each(function(){
			if(this.type == 'pawn') this.EP = false;
		});
		
		// Find whether the last move placed the next player in check
		Players[1].King.inCheck = (check(Players[1].King.position, Players[0], [Players[0].King]))
		
		// Check whether the game has ended due to resignation.
		//Will prevent the turn change but doesn't exit the game. << B. Fisher 3/10 1800
		if (gameOver) {
			alert(Players[0].color + ' resigned on turn ' + turnCount + '.');
		} else {
			this.Players.reverse(); // Switches the active player
			if (Players[0].color == 'white') 
				turnCount++
			change = null;
			
			$('#Dash').css('background', Players[0].color);
			$('#turn').html(Players[0].color);
			
			$("#board img." + Players[0].color).draggable("enable");
		};
		
	};
	
	function select(square){
		/* Function to handle square selection.
		 * Previously selected squares are deselected.
		 * If a square id is passed the square is given the selected class.
		 * If a falsey value is passed than the selectedSquare variable is cleared.
		 */
		$('.legal').removeClass('legal');
		$('.selected').removeClass('selected');
		
		if (square) {
			selectedSquare = square;
			$(selectedSquare).addClass('selected');
		}
		else {
			selectedSquare = null;
		}
	};
	
/*	Disabled due to drop function not completeing before the turn change << B. Fisher 3/06 0145 
 * 
 * 	pieces = $("#board img");
	$(pieces).draggable({
			revert: "invalid",
			revertDuration: 1000,
			grid: [75, 75],
			opacity: 0.7,
			helper: "clone",
			containment: board,
			snap: true,
			start: function(event, ui){
				$('.legal').removeClass('legal'); // Clear legal squares for any previously selected pieces
				select();
				$(Legal($(this).data().piece)).droppable({disabled: false}); // Enable dropping on legal squares
			},
			stop: function(ui){
				$('[aria-disabled="false"]').droppable({disabled: true}); // Clear droppable squares when dragging ends
			}
		});
	
	$(squares).droppable({
		tolerance: "pointer",
		accept: "img",
		activeClass: 'legal',
		drop: function(event, ui){
			$(ui.draggable).data().piece.move(this);
			turn();
		}
	}).droppable({disabled: true});
*/

	$(squares).click(function(event){
		var kid = occupied(this.id);
		
		if(kid && kid.color == Players[0].color){	// checks if piece belongs to the current player
			select(this);
			$(Legal(kid)).addClass('legal');
		} else if($(this).hasClass('legal')) {		// If clicked square is a legal move
			piece = occupied(selectedSquare.id);	// retrieve piece image from the selected square
			
			piece.move(this);
			if (change) turn();
		} else {
			select();			// if square is not occupied, or is occupied by an opponent piece
		};						// that is not capturable than clear the selection
	});
};

// ===============================================
function Player(side){
	this.color = side;
	this.pieces = new Array();
	
	var startRow = (this.color == 'white') ? 1 : 8, // White Player starts on Row 1, Black on row 8
		pawnRow = (this.color == 'white') ? 2 : 7; // Pawns start on the next medial row
	
	var piece, i;
	
	for (p = 0; p <= 7; p++) {
		this.pieces.push(new pawn(this.color, cLabels[p] + pawnRow));
	};
	
	this.pieces.push(new rook(this.color, "A" + startRow));	
	this.pieces.push(new rook(this.color, "H" + startRow));

	this.pieces.push(new knight(this.color, "B" + startRow));
	this.pieces.push(new knight(this.color, "G" + startRow));
	
	this.pieces.push(new bishop(this.color, "C" + startRow));
	this.pieces.push(new bishop(this.color, "F" + startRow));

	this.pieces.push(new queen(this.color, "D" + startRow));

	this.King = new king(this.color, "E" + startRow);
	this.pieces.push(this.King);
	
	var self = this;
	
	//Remove a piece from this players piece array when captured << B. Fisher 3.3 2100
	$(self.pieces).bind('remove', function(){
		var piece = this;
		$.each(self.pieces, function(index, item){
			if(piece === item){
				self.pieces.splice(index, 1);
				return true;
			};
		});
	});
};

//=======================================================
function Piece(color, start){
	this.moved = false;
	this.position = start;
	this.color = color;
	
	this.col = function(){return this.position[0]};
	this.row = function(){return this.position[1]*1};
	
	this.image = $("<img>");
	$(this.image).attr({src:'images/' + this + '_' + color + '.png',
					alt: color + ' ' + this})
					.addClass(color)
					.data("piece", this);  // Adds piece data to the images;
	
	var self = this;
	
	this.place = function(position){
		$(this.image).appendTo("#" + position);
	};
	
	this._move = function(destination){
		var occupent = occupied(destination.id),
			self = this,
			capturedPiece = null;
		
		$(this.image).appendTo(destination);
		if (occupent) capturedPiece = occupent;
		else if (this.EP) capturedPiece = this.EP;
		
		if (capturedPiece) $(capturedPiece).remove();
		
		// Check to see if move results in check << B. Fisher 3/07 2030
		if (check(Players[0].King.position, Players[1], [Players[1].King, capturedPiece])) {
			$('.legal').removeClass('legal');
			$(this.image).appendTo('#' + this.position);
			if(capturedPiece) (capturedPiece.image).appendTo(capturedPiece.position);
			
			alert('Move results in check.');
			$('#' + this.position).removeClass('selected');
			change = false;
			
		}else{
			this.position = destination.id;
			this.moved = true;
			if(capturedPiece) capturedPiece.capture();
			change = true;
		};
	};
	
	this.capture = function(){
//		$(this.image).fadeOut('fast', function(){$(this).remove()});
		$(this.image).remove();
		$(this).trigger('remove');
		return true;
	};
};

// Start piece definitions
function pawn(color, start){
	this.toString = function(){return 'pawn'}
	Piece.call(this, color, start);
	
	// inc variable indicates which direction is forward depending on color.
	// endRow variable is the promotion rank for the pawn << B. Fisher
	var self = this,
		inc = (color == 'white') ? 1 : -1,
		endRow = (color == 'white') ? 8 : 1;
	
	this.type = "pawn";
	this.EP = false;
	
	this.footprint = function(){
		row = self.row(),
		col = self.col(),
		ids = new Array();
		
		if(!self.moved)	ids.push(col + (row + 2*inc));
		else ids.push(col + (row + 1*inc));
		
		ids.push(cLabels[cLabels.indexOf(col)-1] + (row + inc));
		ids.push(cLabels[cLabels.indexOf(col)+1] + (row + inc));
		
		return ids;
	};
	
	this.move = function(destination){
		// Check for en passant
		if(!this.moved && (destination.id.match(4) || destination.id.match(5))){
			var prev = (this.col() == 'A') ? false : occupied(destination.previousElementSibling.id);
			var next = (this.col() == 'H') ? false : occupied(destination.nextElementSibling.id);
			
			if(prev && prev == 'pawn' && prev.color != color) prev.EP = this;
			if(next && next == 'pawn' && next.color != color) next.EP = this;
		};
		
		// Check if pawn is capturing en passant
		if(this.EP && this.EP.position[0] != destination.id[0]) this.EP = false;
		
		this._move(destination)
		
		if(this.row() == endRow) this.promote();
	};
	
	// Pawn promotion functionality << B. Fisher 3/06
	this.promote = function(){
		// Remove the pawn's image, and clear it from the Player's pieces array.
		$(this.image).remove();
		$(this).trigger('remove');
		
		// Request promotion preference from Player and add the requested piece.
		var newPiece = prompt("Promote to a [q]ueen or a k[n]ight?");
		if (newPiece == 'n' || newPiece == 'knight' || newPiece == 'k') {
			Players[0].pieces.push(new knight(this.color, this.position));
		} else Players[0].pieces.push(new queen(this.color, this.position));
	};
	
	self.place(start);
}
pawn.prototype = new Piece();

function rook(color, start){
	this.toString = function(){return 'rook'}
	Piece.call(this, color, start);
	
	var self = this;
	this.type = "rook";
	
	this.move = function(destination){this._move(destination)};
	
	this.footprint = function(){
		row = self.row();
		col = self.col();
		
		return ['A' + row, 'H' + row, col + 1, col + 8];
	};

	self.place(start);
};
rook.prototype = new Piece();

function knight(color, start){
	this.toString = function(){return 'knight'}
	Piece.call(this, color, start);
	
	var self = this;
	this.type = "knight";
	
	this.move = function(destination){this._move(destination)};
	
	this.footprint = function(){
		var ids = [],
			col = cLabels.indexOf(self.col()),
			row = self.row(),
			cShift;
		
		for(var r = row - 2; r <= row + 2; r++){
			if(r != row){
				if(Math.abs(row - r) == 1) {cShift = 2} else {cShift = 1};
				ids.push(cLabels[col + cShift] + r);
				ids.push(cLabels[col - cShift] + r);
			};
		};
		return ids;
	};
	
	self.place(start);
};
knight.prototype = new Piece();

function bishop(color, start){
	this.toString = function(){return 'bishop'}
	Piece.call(this, color, start);
	var self = this;
	this.type = "bishop";
	
	this.move = function(destination){this._move(destination)};
	
	this.footprint = function(){
		return [findDiagonal(this.position, 1, 1),
				findDiagonal(this.position, 1, -1),
				findDiagonal(this.position, -1, 1),
				findDiagonal(this.position, -1, -1)];
	};
	
	self.place(start);
};
bishop.prototype = new Piece();

function queen(color, start){
	this.toString = function(){return 'queen'}
	Piece.call(this, color, start);
	var self = this;
	this.type = "queen";
	
	this.move = function(destination){this._move(destination)};
	
	this.footprint = function(){
		return ['A' + this.row(), 'H' + this.row(), this.col() + 1, this.col() + 8,
				findDiagonal(this.position, 1, 1),
				findDiagonal(this.position, 1, -1),
				findDiagonal(this.position, -1, 1),
				findDiagonal(this.position, -1, -1)];
	}
	self.place(start);
};
queen.prototype = new Piece();

function king(color, start){
	this.toString = function(){return 'king'}
	Piece.call(this, color, start);
	
	var self = this;
	this.type = "king";
	this.inCheck = false;
	this.index = null;
	
	this.move = function(destination){
		if (this.castle() && (destination.id.match('G') || destination.id.match('C'))) {
			if (destination.id.match('G')) {
				var rook = callPiece($('#H' + this.row()).children('img')[0]),
					dest = destination.previousElementSibling;
			}else if (destination.id.match('C')) {
				var rook = callPiece($('#A' + this.row()).children('img')[0]),
					dest = destination.nextElementSibling;
			};
			
			this._move(destination);
			$(rook.image).fadeOut('fast', function(){
				rook.move(dest);
				$(rook.image).fadeIn('fast');
			});
		} else this._move(destination);
	};

	this.castle = function(){
		if(this.inCheck || this.moved) return false;
		else return true;
	};
	
	this.footprint = function(){
		var row = this.row(),
			col = this.col(),
			C = cLabels.indexOf(col),
			squares = [col + (row + 1), col + (row - 1), cLabels[C + 1] + row, cLabels[C - 1] + row,
				cLabels[C + 1] + (row + 1), cLabels[C + 1] + (row - 1), cLabels[C - 1] + (row + 1), 
				cLabels[C - 1] + (row - 1)];
		
		console.log('King squares:' + squares);
		
		return squares;
	};
	
	self.place(start);
};
king.prototype = new Piece();

// End piece definitions
//=======================================================

// Returns array of the ids of squares where a piece can move
function Legal(piece){
	var footprint = piece.footprint(),
		color = piece.color,
		type = piece.type,
		position = piece.position,
		rNum = position[1]*1,
		C = position[0],
		cNum = cLabels.indexOf(C)+1,
		dest, orig,
		legalIDs = "";
	
//	console.log(color + ' ' + type + ' - footprint: ' + footprint + ' | moved: ' + piece.moved);

	
	$(footprint).each(function(){
		if (inside(this, position)){
			if(type == 'knight') {
				if(occupied('#' + this).color != color) legalIDs += writeID(this[0], this[1]);
			}else if(type == 'pawn'){
				// pawns cannot capture on their own column
				if (occupied('#' + this) && occupied('#' + this).color != color && C != this[0]) {
					legalIDs += writeID(this[0], this[1]);
				}
				// Check for a pawn in EP and whether its column matches the move
				else if (piece.EP && piece.EP.col() == this[0]) legalIDs += writeID(this[0], this[1]);
					// add vertical moves
					else if (C == this[0]) legalIDs += vector(position, this, color, false);
			} else {
				legalIDs += vector(position, this, color, true)
			};
		};
	});
	
	// Check for castle legality and add king double step if true. << B. Fisher
	if(type == 'king'){
		if(!piece.inCheck && !piece.moved){				// King is not in check and has not moved
			var rook = occupied('#H' + rNum);
			// Kingside castle squares are unoccupied and unthreatened, and the kingside rook has not moved.
			if(vector(position, 'G' + rNum, color, false).match('G') && rook && !rook.moved && !check('F' + rNum, Players[1], [Players[1].King])){
				legalIDs += writeID('G', rNum);
			};
			
			var rook = occupied('#A' + rNum);
			// Queenside squares between rook and king are not occupied. The king is not moving across check.
			// and the queenside rook has not moved.
			if(vector(position, 'B' + rNum, color, false).match('B') && rook && !rook.moved && !check('D' + rNum, Players[1], [Players[1].King])){
				legalIDs += writeID('C', rNum);
			};
		};
		
		// Removes any square ids from legalIDs that would move the king into check << B. Fisher 3.04 1700
		var squares = legalIDs.split(',');
		for(var i = squares.length-2; i>=0; i--){
			if(check(squares[i], Players[1], [Players[1].King])) squares.splice(i, 1);
		};
		legalIDs = squares.join(',');
		
	};
	// === End King legality checks ===
	
//	console.log(color + ' ' + type + ' legal IDs: ' + legalIDs);
	
	return legalIDs;
};

/* Function: vector
 * Peramiters: start - the pieces location, end - the final square along the given path, side - current players color
 * 				capture - whether opposing pieces can be captured on the last square, 
 * 				pin - if true pass the first opponent piece on the vector
 * Returns: a string of comma seperated square ids for the requested vector, continuing to an occupied square
 * 			if the square is occupied by an opponent piece the vector ids includes that square unless capture is false.
 * Coded by: B. Fisher
 */
function vector(start, end, side, capture){
	var sX = cLabels.indexOf(start[0]),
		eX = cLabels.indexOf(end[0]),
		sY = start[1]*1,
		eY = end[1]*1,	
		xInc = findInc(sX, eX),
		yInc = findInc(sY, eY),
		list = '',
		color, square;
	
	do{
		sX += xInc;
		sY += yInc;
		square = cLabels[sX] + sY;
		color = occupied('#' + square).color;
		
		if(color){
			if(capture && color != side) list += '#' + square + ',';
			break;
		};
		
		list += '#' + square + ',';
		
	}while((cLabels[sX] + sY) != end);
	
	return list;
};

// Checks the square ID for a occupying piece.
// If one is found return the piece, if not return false. << B. Fisher
function occupied(square_ID){
	if (typeof(square_ID) != 'string') return false;
	if(!square_ID.match('#')) square_ID = '#' + square_ID;
	
	var kid = $(square_ID).children('img');
	if (kid.length > 0) {
		kid = kid[0];
		return callPiece(kid);
	}else {
		return false;
	}
};

// Returns a properly formated CSS square ID (for jQuery selection)
// unless the row and/or column are beyound the edge of the board. << B. Fisher
function writeID(column, row) {
	try{
		if (!column) throw 0;
		else if (!row) throw 1;
		else if (row < 0) throw 2;
		else if (row > 8) throw 3;
	}
	catch (er){
		if(er == 0) alert('Square ID Error: column is not defined');
		else if(er == 1) alert('Square ID Error: row is not defined');
		else if(er == 2) alert('Square ID Error: row is less than board index');
		else if(er == 3) alert('Square ID Error: row is greater than board index');
	}
	return '#' + column + row + ","
};

//Simple function to return a comparison between [first] and [second]
// Returns: 1 if greater than, Returns: -1 if less than, Returns: 0 if equal << B. Fisher
function findInc (first, second){
	var Inc;
	
	if(first > second){Inc =  -1}
	else if (first < second){Inc = 1}
	else {Inc = 0};
	
	return Inc;
};

// Returns: the ID of the farthest diagonal square on the board from [start] (requires ID, not object)
// given X and Y increments << B. Fisher
function findDiagonal(start, xInc, yInc){
	var x = cLabels.indexOf(start[0]),
		y = start[1]*1;
		
	do{
		x += xInc;
		y += yInc;
	} while(x > 0 && x < 7 && y > 1 && y < 8);
	
	if(x < 0 || x >7 || y < 1 || y > 8){return};
	
	return(cLabels[x] + y);
};

// Checks that square is valid and not equal to origin, and its coordinates are inside the board.
// housekeeping function for Legal << B. Fisher
function inside(square, origin){
	if(square && origin != square && square[1] * 1 >= 1 && square.substr(1) * 1 <= 8 && cLabels.indexOf(square[0]) >= 0) return true;
	else return false;
};

// Returns: pieces that are threatening the square location (requires string in 'RC' format where R = row and C = column).
// var ignore is a piece. It can be used to prevent recursion in the Legal object, helps in pinning checks.
// If threatening pieces are found return an array of their objects, else returns false. << B. Fisher
function check(square, player, ignore){
	var chk = false, ids;
	$(player.pieces).each(function(){
		if (!$(ignore).match(this)) {
			ids = Legal(this);
			if (ids.match(square)) {
				if (!chk) 
					chk = new Array();
				chk.push(this);
			};
		};
	});
	return chk;
};

function callPiece(image){
	return $(image).data().piece;
};

function Checkmate(){
	//if players king is in check
	
	// if checking piece is vulnerable
	
	//if all available moves for the king are threatened
};

function Stalemate(Player) {
	var legalMoves = '';
	$.each(Player.pieces, function(){
		legalMoves += this.Legal;
	});
	if(legalMoves.length > 0) return true;
	else return false;
	
};


(function($){
	$.fn.match = function(item){
		var matchValue = false;
	  	this.each(function(){
		  	if(this == item) matchValue = true;
		});
		return matchValue;
	};
 }(jQuery));