//add vars for chat
//connect js and jquery for chat
//html edits to make sure you  can
//fix with proper names (if not done already)
//error tests (DO AT BEGINNING IF GONNA DO)
//formatting change - rearrange all reatures:
//chat all down left
//game down right next to it
//with guess/word below
//right next to that is the guessing with individual scores
//colors in bigger cooler blocks below biggger guess block
//(if guesses arent with names)
//rules in tab with chat, and also deah center after enter
//username - maybe rules/gamplay video/screencast


// FIREBASE ADDITION FOR CHAT AND USERNAMES ITS THE PERFECT DB HERE





// Initialize variables
var socket = io();
var user;
var context;
var canvas;
var click = false;
var users = [];

// Username setup funcction
function usernameAsk() {
    $('.grey-out').fadeIn(300);
    $('.user').fadeIn(300);
    $('.user').submit(function(){
        event.preventDefault();
        user = $('#username').val().trim();

        if(user == '') {
            return false
        };

        var index = users.indexOf(user);

        if(index > -1) {
            alert(user + ' already exists');
            return false
        };
        
        socket.emit('join', user);
        $('.grey-out').fadeOut(300);
        $('.user').fadeOut(300);
        $('input.guess-input').focus();
    });
};

// Function to clear canvas
var clearScreen = function() {
    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
};

// Guesser setup
var guesser = function() {
    clearScreen();
    click = false;
    console.log('draw status: ' + click);
    $('.draw').hide();
    $('#guesses').empty();
    console.log('You are a guesser');
    $('#guess').show();
    $('.guess-input').focus();
    $('#guess').on('submit', function() {
        event.preventDefault();
        var guess = $('.guess-input').val();
        
        if (guess == '') {
            return false
        };

        console.log(user + "'s guess: " + guess);
        socket.emit('guessword', {username: user, guessword: guess});
        $('.guess-input').val('');
    });
};

// When a word is guessed
var guessword = function(data){
    $('#guesses').text(data.username + "'s guess: " + data.guessword);

    if (click == true && data.guessword == $('span.word').text() ) {
        console.log('guesser: ' + data.username + ' draw-word: ' + $('span.word').text());
        socket.emit('correct answer', {username: data.username, guessword: data.guessword});
        socket.emit('swap rooms', {from: user, to: data.username});
        click = false;
    }
};

// Places chosen word in span for drawer to see
var drawWord = function(word) {
    $('span.word').text(word);
    console.log('Your word to draw is: ' + word);
};

// Create html to place users in userlist
var userlist = function(names) {
    users = names;
    var html = '<p class="chatbox-header">' + 'Players' + '</p>';
    
    for (var i = 0; i < names.length; i++) {
        html += '<li>' + names[i] + '</li>';
    };
    $('ul').html(html);
};

// Function executed on new drawer, with cleared canvas and no guesses shown
var newDrawer = function() {
    socket.emit('new drawer', user);
    clearScreen();
    $('#guesses').empty();
};

// Correct answer function
var correctAnswer = function(data) {
    $('#guesses').html('<p>' + data.username + ' guessed correctly!' + '</p>');
};

// Reset screen function
var reset = function(name) {
    clearScreen();
    $('#guesses').empty();
    console.log('New drawer: ' + name);
    $('#guesses').html('<p>' + name + ' is the new drawer' + '</p>');
};




//Line drawing function
function drawLine(fromx, fromy, tox, toy){
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }

// Draw functionality v1 replaced by v2 to improve on the circle draw methods inherent latency issues
//var draw = function(obj) {
//    context.fillStyle = obj.color;
//    context.beginPath();
//    context.arc(obj.position.x, obj.position.y, 6, 0, 2 * Math.PI);
//    context.fill();
//};

//V2 draw function to solve v1's "skipping" issues
var draw = function(obj) {
    if(drawing){

            drawLine(prev.x, prev.y, e.pageX, e.pageY);

            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    };
}



// Gameplay function
var pictionary = function() {
    clearScreen();
    click = true;
    console.log('draw status: ' + click);
    $('#guess').hide();
    $('#guesses').empty();
    $('.draw').show();

    var drawing;
    var color;
    var obj = {};

    $('.draw-buttons').on('click', 'button', function(){
        obj.color = $(this).attr('value');
        console.log(obj.color);

        if (obj.color === '0') {
            socket.emit('clear screen', user);
            context.fillStyle = 'white';
            return;
        };
    });

    console.log('You are the drawer');

    $('.users').on('dblclick', 'li', function() {
        if (click == true) {
            var target = $(this).text();
            socket.emit('swap rooms', {from: user, to: target});
        };
    });

    canvas.on('mousedown', function(event) { 
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;   
    });
    canvas.on('mouseup', function(event) {
        drawing = false;
    });

    cavas.on('mousemove',function(event){
        if($.now() - lastEmit > 30){
            socket.emit('mousemove',{
                'x': event.pageX,
                'y': event.pageY,
                'drawing': drawing,
                'id': id
            });
            lastEmit = $.now();
        }

        // Draw a line for the current user's movement, as it is
        // not received in the socket.on('moving') event above

        if(drawing){

            drawLine(prev.x, prev.y, e.pageX, e.pageY);

            prev.x = e.pageX;
            prev.y = e.pageY;
    };

});

// Function below executes on ready, establishing the game
$(document).ready(function() {

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

