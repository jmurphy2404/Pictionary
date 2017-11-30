var socket = io();
var player;
var context;
var canvas;
var click = false;

function usernameAsk() {
	$('.grey-out').fadeIn(300);
	$('.user').fadeIn(300);
	$('.user').submit(function(e){
		e.preventDefault();
		player = $('.username').val().trim();

		if (player == ''){
			return false
		};

		var index = players.indexOf(player);

		if (index > -1){
			alert(player + ' already exists');
			return false
		};

		socket.emit('join', player);
		$('.grey-out').fadeOut(200);
		$('.user').fadeOut(200);
		$('input.guess-input').focus();
	});
};

