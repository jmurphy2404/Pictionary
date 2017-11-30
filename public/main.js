var socket = io();
var player;
var context;
var canvas;
var click = false;
var players = [];

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

var clearScreen = function(){
	context.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

var guesser = function(){
	clearScreen();
	click = false;
	$('#guesses').empty();
	$('.draw').hide();
	$('#guess').show();
	$('.guess-input').focus();

	$('#guess').on('submit', function(e){
		e.preventDefault();
		var guess = $('.guess-input').val();

		if(guess == ''){
			return false
		};

		socket.emit('guessword', {username: player, guessword: guess});
		$('.guess-input').val('');
	});
};

var guessword = function(data){
	$('#guesses').text(data.username + "'s guess: " + data.guessword);

	if(click == true && data.guessword == $('span.word').text()){
		socket.emit('correct answer', {username: data.username, guessword: data.guessword}):
		socket.emit('swap rooms', {from: player, to: data.username});
		click = false;
	};
};

var drawWord = function(word){
	$('span.word').text(word);
};

var userlist = function(names){
	players = names;
	var html = '<p class="chatbox-header">' + 'Players' + '</p>';
	for (var i = 0; i < names.length; i++){
		html += '<li>' + names[i] + '</li>';
	};
	$('ul').html(html);
};

var newDrawer = function() {
	socket.emit('new drawer', player);
	clearScreen();
	$('#guesses').empty();
};

var correctAnswer = function(data){
	$('#guesses').html('<p>' + data.username + ' guessed correctly!' + '</p>');	
};


