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
 */

var cLabels = "ABCDEFGH", Players = [];

function Game(){
	var self = this,
	pieces,
	board = $('#board'),
	squares = $('#board ul li'),
	selectedSquare = null;
	
	Players = [new Player('white'), new Player('black')];
	
	function turn(){
		select(false);
		$(pieces).draggable("disable");
		$('.legal').removeClass('legal')
		
		this.Players.reverse();
		alert(this.Players[0].color);
		
		$('#Dash').css('background', currentPlayer);
		$('#turn').html(Players[0].color);
		
		$("#board img." + Players[0].color).draggable("enable");
		
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
	
	function movePiece(piece, square){
		/* Handles relocating pieces and capturing opponent pieces as well as
		 * functionality of castling for the king (finding and moving the rook)
		 * and checking for en passant capture on pawns.
		 */
		var pieceData = $(piece).data().piece,
			kid = $(square).children('img'),
			origin = pieceData.position,
			oRow = origin[1] * 1,
			oCol = cLabels.indexOf[origin[0]],
			squareID = $(square).attr('id');
		
		// If the destination square contains a piece (kid variable) remove it.
		if (kid.length) {
			$(kid).fadeOut('slow', function(){
				$(this).remove();
				$(piece).appendTo(square);
			});
		}
		else {
			$(piece).appendTo(square); // Moves the piece to the destination square
		};
		
		/* Castleing functionality (legality is handled by the Legal function)
		 * If the king moves two squares on his first move (landing on column 'G' or 'C')
		 * a castle has been performed. The corrosponding rook is located, moved past the king
		 * (to column 'D' or 'F' respectivly) and its moved, and position variables are updated.
		 */ 
		if(pieceData.type == 'king' && !pieceData.moved && (squareID.match('G') || squareID.match('C'))){
			if(squareID.match('G')){
				var rook = $('#H' + oRow).children('img')[0],
					dest = $(square).prev();
			}else if(squareID.match('C')){
				var rook = $('#A' + oRow).children('img')[0],
					dest = $(square).next();
			};
			$(rook).fadeOut('fast', function(){
				$(this)
					.appendTo(dest)
					.fadeIn('fast')
			}).data().piece.moved = true;
			$(rook).data().piece.position = $(dest).attr('id');
		};
		// Checking for En Passant - John-Michael
		if(pieceData.type == 'pawn' && !pieceData.moved && (squareID.match('4') || squareID.match('5'))){
			var prev = $(square).prev().children('img')[0],  // pawn to left
				next = $(square).next().children('img')[0],  // pawn to right
				inc = (pieceData.color == 'white') ? 1 : -1; // our pawn, if white it's 1, otherwise it's -1
			
			// If pawn to left is not the same color (enemy pawn)
			if(prev && $(prev).data().piece.type == 'pawn' && ($(prev).data().piece.color != pieceData.color)){
				var EP = writeID(origin[0], oRow+inc);
				$(prev).data().piece.EP = EP; // And set EP to the point behind the enemy
				console.log($(prev).data().piece);
			// Else if pawn to right is not the same color (enemy pawn)
			} else if(next && $(next).data().piece.type == 'pawn' && ($(next).data().piece.color != pieceData.color)){
				var EP = writeID(origin[0], (oRow+inc));
				$(next).data().piece.EP = EP; // And set EP to the point behind the enemy
				console.log($(next).data().piece);
			}
		};
		
		pieceData.moved = true;
		pieceData.position = square.id;
		
	function enPassant(pawn){
		if (pawn) {
			data = $(pawn).data().piece;
			if (data.type == 'pawn' && data.color != color) {
				data.EP = '#' + squareID
			};
		};
	};
	
	turn();
	};
	
// === End movePiece function ===
	
	pieces = $("#board img");
	
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
				$(Legal(this)).droppable({disabled: false}); // Enable dropping on legal squares
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
			movePiece(ui.draggable, this);
		}
	}).droppable({disabled: true});
	
	$(squares).click(function(event){
		var kid = $(this).children('img')[0];
		
		if(kid && $(kid).data().piece.color == Players[0].color){
			select(this);
			$(Legal(kid)).addClass('legal');
		} else if($(this).hasClass('legal')) {
			piece = $(selectedSquare).children('img')[0];
			movePiece(piece, this);
		} else {
			select();
		};
	});
};

// ===============================================
function Player(side){
	this.color = side;
	this.pieces = new Array();
	
	var startRow = (this.color == 'white') ? 1 : 8, // White Player starts on Row 1, Black on row 8
	pawnRow = (this.color == 'white') ? 2 : 7; // Pawns start on the next medial row
	
	for (p = 0; p <= 7; p++) {
		this.pieces.push(new pawn(this.color, cLabels[p] + pawnRow));
	};

	this.pieces.push(new rook(this.color, "A" + startRow));
	this.pieces.push(new rook(this.color, "H" + startRow));

	this.pieces.push(new knight(this.color, "B" + startRow));
	this.pieces.push(new knight(this.color, "G" + startRow));
	
	this.pieces.push(new bishop(this.color, "C" + startRow));
	new bishop(this.color, "F" + startRow);

	this.pieces.push(new queen(this.color, "D" + startRow));
	this.pieces.push(new king(this.color, "E" + startRow));
	
}

//=======================================================
function Piece(color, position){
	this.color = color;
	this.moved = false;
	this.position = position;
	
	this.col = function(){return this.position[0]};
	this.row = function(){return this.position[1]*1};
	
	this.image = $("<img>");
	$(this.image).attr({src:'images/' + this + '_' + color + '.png',
					alt: color + ' ' + this})
					.addClass(color)
					.data("piece", this);  // Adds piece data to the images;
	
	function capture(){
		$(this.image).remove();
	};
	
	this.place = function(position){
		$(this.image)
			.appendTo("#" + position)
	};
};

// Start piece definitions
function pawn(color, start){
	this.toString = function(){return 'pawn'}
	Piece.call(this, color, start);
	
	var self = this;
	this.type = "pawn";
	this.EP = false;
	
	this.footprint = function(){
		var inc = (color == 'white') ? 1 : -1,
		row = self.row(),
		col = self.col();
		
		if(!self.moved){
			return [col + (row + 2*inc)];
		} else {
			return [col + (row + 1*inc)];
		}
	};
	
	self.place(start);
}
pawn.prototype = new Piece();

function rook(color, start){
	this.toString = function(){return 'rook'}
	Piece.call(this, color, start);
	
	var self = this;
	this.type = "rook";
	
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
	
	this.footprint = function(){return[]};
	
	self.place(start);
};
knight.prototype = new Piece();

function bishop(color, start){
	this.toString = function(){return 'bishop'}
	Piece.call(this, color, start);
	var self = this;
	this.type = "bishop";
	
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
	this.check = false;
	
	this.castle = function(){
		if(this.check || this.moved){
			return false;
		};
	};
	
	this.footprint = function(){
		var row = this.row(),
			col = this.col(),
			C = cLabels.indexOf(col);
		
		return [col + (row + 1), col + (row - 1), cLabels[C + 1] + row, cLabels[C - 1] + row,
		cLabels[C + 1] + (row + 1), cLabels[C + 1] + (row - 1), cLabels[C - 1] + (row + 1), cLabels[C - 1] + (row - 1)];
	};
	
	self.place(start);
};
king.prototype = new Piece();

// End piece definitions
//=======================================================

// Returns array of the ids of squares where a piece can move
function Legal(piece){
	var pieceData = $(piece).data().piece,
		footprint = pieceData.footprint(),
		color = pieceData.color,
		type = pieceData.type,
		position = pieceData.position,
		rNum = position[1]*1,
		C = position[0],
		cNum = cLabels.indexOf(C)+1,
		dest, orig,
		legalIDs ="";
	
	console.log(color + ' ' + type +'- footprint: ' + footprint + ' | moved: ' + pieceData.moved);
	
	//Check for castle legality and add king double step if true
	if(type == 'king'){
		if(!pieceData.check && !pieceData.moved){
			var kid = $('#H' + rNum).children('img')[0];
			if (kid) {
				rook = $(kid).data().piece
			}
			
			if(vector(position, 'G' + rNum, color, false).match('G') && !rook.moved){
				legalIDs += writeID('G', rNum);
			};
			
			var kid = $('#A' + rNum).children('img')[0];
			if (kid) {
				rook = $(kid).data().piece
			}
			if(vector(position, 'B' + rNum, color, false).match('B') && !rook.moved){
				legalIDs += writeID('C', rNum);
			};
		};
	};
	
	$(footprint).each(function(){
		if (this.length && position != this && this[1]*1 >= 1 && this[1]*1 <= 8 && cLabels.indexOf(this[0]) >= 0){
			legalIDs += vector(position, this, color, type != 'pawn');
		};
	});
	
	// pawn capture
	if (type == 'pawn'){
		var fStep = (color == 'black') ? rNum - 1 : rNum + 1;
		
		if (pieceData.EP){legalIDs += pieceData.EP};
		
		dest = writeID(cLabels[cNum - 2], fStep);
		if(occupied(dest) && occupied(dest) != color){legalIDs += dest;};
		
		dest = writeID(cLabels[cNum], fStep);
		if(occupied(dest) && occupied(dest) != color){legalIDs += dest;};
		
		if(pieceData.EP){legalIDs += pieceData.EP};
	};
	
	if(type == 'knight'){
		var kCol = cLabels.indexOf(C),
			cShift;
		
		for(var r = rNum - 2; r <= rNum + 2; r++){
			if(r != rNum){
				if(Math.abs(rNum - r) == 1) {cShift = 2} else {cShift = 1};
				
				dest = writeID(cLabels[kCol + cShift], r);
				if(!(occupied(dest) == color)){legalIDs += dest};
				
				dest = writeID(cLabels[kCol - cShift], r);
				if(!(occupied(dest) == color)){legalIDs += dest};
			}
		}
	};
	
	console.log('Legal IDs: ' + legalIDs);
	
	return legalIDs;
};

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
		color = occupied('#' + square);
		
		if(color){
			if(capture && color != side){list += '#' + square + ',';}
			break;
		};
		
		list += '#' + square + ',';
		
	}while((cLabels[sX] + sY) != end);
	
	return list;
		
};

function occupied(square_ID){
	var kid = $(square_ID).children('img');
	if(kid.length > 0){return kid.data().piece.color};
	return false;
};

function writeID(column, row) {
	if(column && row && row > 0 && row <= 8){
		return '#' + column + row + ","
	}
	return "";
};

function findInc (first, second){
	var Inc;
	
	if(first > second){Inc =  -1}
	else if (first < second){Inc = 1}
	else {Inc = 0};
	
	return Inc;
};

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

function check(square){
	return false;
};
