var express = require('express');
var ejs = require('ejs');
var socket = require('socket.io')
var app = express();
 
app.get('/', function (req, res) {
   res.render('home.html');
})

app.use('/static', express.static('public'))
app.set('views','./public/views')
app.set('view engine','html')
app.engine('html',ejs.renderFile) 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
var io = socket.listen(server)
server.lastPlayderID = 0; // Keep track of the last id assigned to a new player

io.on('connection',function(socket){
  socket.on('newplayer',function(){
    socket.player = {
        id: server.lastPlayderID++,
        x: randomInt(100,400),
        y: randomInt(100,400)
    };
    socket.emit('playerID',socket.player.id);
    socket.emit('allplayers',getAllPlayers());
    socket.broadcast.emit('newplayer',socket.player);
    socket.on('keydown',function(data){
      socket.player.moveX = data.moveX
      socket.player.moveY = data.moveY
      io.emit('move',socket.player);
    });

    socket.on('disconnect',function(){
      io.emit('remove',socket.player.id);
    });
  });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}