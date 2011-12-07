$(function(){
	$('#clear').click(function(){
		$('#board img').each(function(){
			piece = Game.callPiece(this);
			if (piece.type != "king") {
				piece.kill();
				$(piece.image).remove();
			};
		});
		
	    $('.legal').removeClass('legal');
	    $('.selected').removeClass('selected');
	    $('.threat').removeClass('threat');
	    $('.attack').removeClass('attack');
	});
	
	$('#staging img').draggable({
		containment: Game.board,
		helper: 'clone',
		opacity: 0.8,
		snap: true
	});
	
	$('#board ul li').droppable({
		drop: function(event, ui){
			$dragging = $('.ui-draggable-dragging');
			info = $dragging.attr('alt').split(' ');
			player = (Game.Players[0].color == info[0]) ? Game.Players[0] : Game.Players[1];
			
			player.addPiece(info[1], info[0], this.id);
		}
	});
});
