$('#clear').click(function(){
	$('#board img').remove();
	
	$(Game.Players).each(function(){
		this.pieces = [];
		this.pawns = [];
		this.king = null;
	});
});

$('#staging img').draggable({helper:'clone'});
