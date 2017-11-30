var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
server.listen(process.env.PORT || 8080, function(){
	console.log('Server started at http://localhost:8080');
});

var players = [];

var words = [ "hotdog sandwich", "apple", "Trump", "scissors", "pineapple", "penguin", "lunch", "desk", "albino", "coffee" ];

var wordcount;

function newWord() {
	wordcount = Math.floor(Math.random() * (words.length));
	return words[wordcount];
};

io.on('connection', function(socket){
	io.emit('userlist', players);
	
	socket.on('join', function(name){
		socket.username = name;
		socket.join(name);
		console.log(socket.username + ' has joined. SocketID: ' + socket.id);
		players.push(socket.username);
		
		if (players.length == 1 || typeof io.sockets.adapter.rooms['drawer'] === 'undefined'){
			socket.join('drawer');
			io.in(socket.username).emit('drawer', socket.username);
			console.log(socket.username + ' is drawing now');
			io.in(socket.username).emit('draw word', newWord());
		} else {
			socket.join('guesser');
			io.in(socket.username).emit('guesser', socket.username);
			console.log(socket.username + ' is guessing now');
		}
		
		io.emit('userlist', players);
	});

	socket.on('draw', function(data){
		socket.broadcast.emit('draw', data);
	});

	socket.on('guessword', function(data){
		io.emit('guessword', {username: data.username, guessword: data.guessword});
		console.log(data.username ' triggered guessword event with word ' + data.guessword);
	});

	socket.on('disconnect', function(){
		for (var i = 0; i < players.length; i++){
			if (players[i] == socket.username){
				players.splice(i, 1);
			};
		};
		console.log(socket.username + ' disconnected');
		io.emit('userlist', players);

		if (typeof io.sockets.adapter.rooms['drawer'] === 'undefined'){
			var rand = Math.floor(Math.random() * (players.length));
			io.in(players[rand]).emit('new drawer', players[rand]);
		};
	});

	socket.on('new drawer', function(name){
		socket.leave('guesser');
		socket.join('drawer'):
		console.log(name + ' new drawer');
		socket.emit('drawer', name);
		io.in('drawer').emit('draw word', newWord());
	});

	socket.on('swap rooms', function(data){
		socket.leave('drawer');
		socket.join('guesser');
		socket.emit('guesser', socket.username);
		io.in(data.to).emit('drawer', data.to);
		io.in(data.to).emit('draw word', newWord());
		io.emit('reset', data.to);
	});

	socket.on('correct answer', function(data){
		io.emit('correct answer', data);
	});

	socket.on('clear screen', function(name){
		io.emit('clear screen', name);
	});

});