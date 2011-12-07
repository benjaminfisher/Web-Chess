Web Chess
=========
**A web-based Chess application using HTML5, CSS3 & JavaScript with jQuery**

- **Author:** Benjamin Fisher
- **Collaborator:** John-Michael Glenn
- **Date:** January 2011

- **Description:** Web based chess application. Layout is via HTML5 with CSS3 styling.
Functionality is via JavaScript utilizing the jQuery library.
Play is hot-seat between two players (no AI).

-------------------------------------------------------------------------

_Version 12_ - All pieces but king are moving legally except en Passant capture. Footprint function added to pieces.
_v12.1_ - Added basic king moves, still needs castle functionality & legality.
_v12.2_ - Added castle legality & functionality, rook moves but looses its data
_v12.3_ - Corrected rook issues when castling

^^^ B. Fisher ^^^

-------------------------------------------------------------------------

_Version 13_ - Revised CSS. Added marble background with opacity on the squares. << B. Fisher

v13.1 - Added and corrected En Passant << J-M Glenn

v13.3 - Removed the Player object from the Game object. Creating a Player sets up its pieces.
			Set Players as a global var. Turn changes reverses the Players array. << B. Fisher

v13.2 - Fixed En Passant and implemented enPassant() function << J-M Glenn
 
v13.4 - En Passant capture is fully functional including clearing the pawns EP variables at the end
			of the current player's turn. << B. Fisher 2/28 2100

v13.5 - check function passed initial testing. Captured pieces need to be removed from Player pieces array << B. Fisher 3/1 0330

-------------------------------------------------------------------------

_Version 14_
v14.3 - Moved capture functionality to the Player object. Pieces are now removed from the array on capture.
			Check function is working. Added Checkmate (comments only) and Stalemate function (untested). << B. Fisher 3/03 2200

v14.4 - Modified check function to return checking pieces. << B. Fisher 3/04 0300

v14.5 - Added skipKing option to the check function to prevent recursion over the Legal function.
			Legal is removing threatened squares from the kings legal moves. Still doesn't recognize protected pieces.
			Started adding movePiece functionality into the Piece.move() function. << B. Fisher 3/04 1930

-------------------------------------------------------------------------

_Version 15_ - Removed the movePiece function. All piece movement is now handled by the individual piece objects
			and the Piece class. Revamped the Legality function to handle pawn capture and en passant legality.
			also disabled piece drag and drop due to issues with turn changes. << B. Fisher 3/05 2310

v15.1 - Added pawn promotion << B. Fisher 3/06 0230

v15.2 - Corrected issue with piece removal from pieces array on capture << B. Fisher 3/06 0430

v15.3 - Added pinning check to Piece._move function. Detaches the piece and runs check before moving the piece.
			Still doesn't work fully, as the piece should still be able to move within the pinning vector << B. Fisher 3/07 2100

v15.4 - Resolved pinned against king issues except when the pinning piece captures the pinner << B. Fisher 3/07 2115

v15.5 - Still working on pinned against king issues. Pinning piece can move if not resulting in check. King in check isn't able to move
			except to take the checking piece due to recursion issues with Legal and check functions. << B. Fisher 3/10 0500

-------------------------------------------------------------------------

_Version 16_ - Added resign button with gameOver and turnCount variables. << B. Fisher 3/10 1800

v16.1 - Added the prison to display captured pieces << B. Fisher 33/10 1915

v16.2 - Adding the move logging table along with it's styling << J-M Glenn

v16.3 - Attempting to remove opposing king's footprint from moving king's available moves with the match function.
		Currently removing squares that should be legal. << B. Fisher 3/10 2215
		
v16.4 - Added auto-scrolling to the move logger << J-M Glenn

v16.5 - Added functionality for the 'prison' to show captured pieces. << B. Fisher 3/11 1830

v16.6 - Removed pawns from player's pieces array, added to Player.pawns array.
          Resolved check issues. Corrected opponent pawn capture and move when requesting check function. Also corrected opponent king moves when 
         calling check function. << B. Fisher 3/14 2200
         
v16.7 - Simplified king.footprint function, now easier to parse feedback. << B. Fisher

v16.8 - Added endGame function to cover the board and disable the resign button. << B. Fisher 3/16 1845

-------------------------------------------------------------------------

_Version 17_   - Coded endGame function with scenarios for resignation, checkmate and stalemate. << B. Fisher 3/17 2130

v17.1 - Coded move logging and specialty case of logging castling. << J-M Glenn

-------------------------------------------------------------------------

_Version 18_ - Modifications to Legal function. The function now returns an array of pieces of the same color that the called piece interacts with.
           The legal moves are returned as the 'moves' key pair value. Will need to be called after a move finishes to find new protected pieces. 
           << B. Fisher 3/21

v18.1 - Cleaned up the logMove function. Consolidated duplicate <tr> creation and formatting. << B. Fisher 3/23 1930

v18.2 - Added pawn promotion logging. << B. Fisher 3/29

-------------------------------------------------------------------------

_Version 19_ - Wrapped all functionality within the Game object to remove global variables.
		Only active players pieces are outlined on hover, instead of all squares. << B. Fisher 5/6
		
v19.1 - Corrected issues with removing pieces from player arrays on capture. << B. Fisher 5/23

v19.2 - Removed code to hide elements with a class of .hidden, and added visibility:hidden property to CSS.
	Corrected issues with the div#cover and prison that resulted from this change. << B. Fisher 101311

v19.5 - Adding Test environment and documentation files << B. Fisher 102511

v19.6 - Moved documentation files to a seperate repo, hope to intigrate with webchess wiki page.
		Current round of optimization complete; all dependant methods moved outside of constructors. << B. Fisher 110811

v19.7 - Removed Player name prompts, and added form to request player names.
		Also removed check alert; threatened king shows on red << B. Fisher 110911
	
v19.8 - Resolved most of the issues with optimized code, including now king cannot capture protected pieces.
		Promoted pieces are being added to the piece array, and removed from array on capture.
		Also added attack class to show what opposing piece is attacking the king when in check. << B. Fisher 112311
		
v19.9 - Player names captured via form. << B. Fisher 112911

-------------------------------------------------------------------------
_Version 20_ - Merge optimize branch back into master. << B. Fisher 112911

v20.1 - Removed prompts from pawn promotion. Move logging is glitching (logCell is incorrect after first promotion) << B. Fisher 113011

v20.2 - Test Board is working. Able to drag and drop new pieces. Resolved check vector issues 
		(king moving to threatened square that he blocked) except for opponent pieces adjacent
		to the king << B. Fisher 120711
		
v20.3 - Stalemate is working << B. Fisher 120711
	- v20.3.1 - pawn promotion logging fixed << B. Fisher 120711
	
v20.4 - All alerts removed. Style for cover notes and forms still needs some work.
