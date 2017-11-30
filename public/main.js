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

var reset = function(name){
	clearScreen();
	$('#guesses').empty();
	$('#guesses').html('<p>' + name + ' is the new drawer' + '</p>');
};

var draw = function(obj){
	context.fillStyle = obj.color;
	context.beginPath();
	context.arc(obj.postion.x, obj.postion.y, 3, 0, 2 * Math.PI);
	context.fill();
};

var pictionary = function(){
	clearScreen();
	click = true;
	$('#guess').hide();
	$('#guesses').empty();
	$('.draw').show();

	var drawing;
	var color;
	var obj = {};

	$('.draw-buttons').on('click', 'button', function(){
		obj.color = $(this).attr('value');\

		if(obj.color === '0'){
			socket.emit('clear screen', player);
			context.fillStyle = 'white';
			return;
		};
	});

	$('.users').on('dblclick', 'li', function(){
		if(click == true){
			var target = $(this).text();
			socket.emit('swap rooms', {from: player, to: target});
		};
	});

	canvas.on('mousedown', function(event){
		drawing = true;
	});

	canvas.on('mouseup', function(event){
		drawing = false;
	});

	canvas.on('mousemove', function(event){
		var offset = canvas.offset();
		obj.position = {x: event.pageX - offset.left, y: event.pageY = offset.top};

		if(drawing == true && click == true){
			draw(obj);
			socket.emit('draw', obj);
		};
	});
};

$(document).ready(function(){
	canvas = $('#canvas');
	context = canvas[0].getContext('2d');
	canvas[0].width = canvas[0].offsetWidth;
	canvas[0].height = canvas[0].offsetHeight;

	usernameAsk();

	socket.on('userlist', userlist);
	socket.on('guesser', guesser);
	socket.on('guessword', guessword);
	socket.on('draw', draw);
	socket.on('draw word', drawWord);
	socket.on('drawer', pictionary);
	socket.on('new drawer', newDrawer);
	socket.on('correct answer', correctAnswer);
	socket.on('reset', reset);
	socket.on('clear screen', clearScreen);
});