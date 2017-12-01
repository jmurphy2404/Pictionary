var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
server.listen(process.env.PORT || 8080, function() {
	console.log('Server started at http://localhost:8080');
});

var users = [];
var words = [
    "word", "letter", "number", "person", "man", "police", "people", "sound", "water",
     "men", "woman", "women", "boy", "seagull", "hotdog", "hamburger", "Earth", "Trump",
    "girl", "serial killer", "Oregon Trail", "week", "month", "name", "sentence", "line",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father", "air",
    "big foot", "sister", "world", "head", "page", "country", "question",  "breakfast",
    "shiba inu", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east", "man",
    "west", "child", "children", "computer", "paper", "music", "river", "car", "pigeon"
    "Power Rangers", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",  "feather",
    "body", "fart", "family", "song", "door", "forest", "wind", "ship", "area",
    "rock", "Captain Planet", "fire", "problem", "airplane", "top", "bottom", "king",
    "space", "whale", "unicorn", "narwhal", "furniture", "sunset", "sunburn", "Grumpy cat",
];
var wordcount;

function newWord() {
	wordcount = Math.floor(Math.random() * (words.length));
	return words[wordcount];
};

io.on('connection', function (socket) {
	io.emit('userlist', users);

	socket.on('join', function(name) {
		socket.username = name;

		socket.join(name);
		console.log(socket.username + ' has joined. ID: ' + socket.id);

		users.push(socket.username);

		if (users.length == 1 || typeof io.sockets.adapter.rooms['drawer'] === 'undefined') {

			socket.join('drawer');

			io.in(socket.username).emit('drawer', socket.username);
			console.log(socket.username + ' is a drawer');

			io.in(socket.username).emit('draw word', newWord());
		} 

		else {

			socket.join('guesser');

			io.in(socket.username).emit('guesser', socket.username);
			console.log(socket.username + ' is a guesser');
		}
	
		io.emit('userlist', users);
		
	});

	socket.on('draw', function(obj) {
		socket.broadcast.emit('draw', obj);
	});

	socket.on('guessword', function(data) {
		io.emit('guessword', { username: data.username, guessword: data.guessword})
		console.log('guessword event triggered on server from: ' + data.username + ' with word: ' + data.guessword);
	});

	socket.on('disconnect', function() {
		for (var i = 0; i < users.length; i++) {

			if (users[i] == socket.username) {
				users.splice(i, 1);
			};
		};
		console.log(socket.username + ' has disconnected.');

		io.emit('userlist', users);

		if ( typeof io.sockets.adapter.rooms['drawer'] === "undefined") {
			
			var x = Math.floor(Math.random() * (users.length));
			console.log(users[x]);

			io.in(users[x]).emit('new drawer', users[x]);
		};
	});

	socket.on('new drawer', function(name) {

		socket.leave('guesser');

		socket.join('drawer');
		console.log('new drawer emit: ' + name);

		socket.emit('drawer', name);
		
		io.in('drawer').emit('draw word', newWord());
	
	});

	socket.on('swap rooms', function(data) {

		socket.leave('drawer');
		socket.join('guesser');

		socket.emit('guesser', socket.username);

		io.in(data.to).emit('drawer', data.to);

		io.in(data.to).emit('draw word', newWord());
	
		io.emit('reset', data.to);

	});

	socket.on('correct answer', function(data) {
		io.emit('correct answer', data);
		console.log(data.username + ' guessed correctly with ' + data.guessword);
	});

	socket.on('clear screen', function(name) {
		io.emit('clear screen', name);
	});

})
