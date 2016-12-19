"use strict";

var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
var socket ;


var messages = [];
var sockets = [];

router.use(express.static(path.resolve(__dirname, 'client')));


io.on('connection', function (socket) {
    socket.join('FLIC-ROOM');
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var err = new Error('Not Found');
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anzeige'), function (err) {
        updateRoster();
      });
    });
  
  });

router.get('/click', function(req, res)
{
  console.log("click");
  var data = {
    name: "Flic weiß",
    text: "click"
  };
  io.sockets.in('FLIC-ROOM').emit('message',data);

});
  

router.get('/dclick', function(req, res, next)
{
  
  console.log("dclick")
  var data = {
    name: "Flic weiß",
    text: "doubleclick"
  };
  io.sockets.in('FLIC-ROOM').emit('message',data);
});

router.get('/hold', function(req, res, next)
{
  
  console.log("hold")
  var data = {
    name: "Flic weiß",
    text: "hold"
  };
  io.sockets.in('FLIC-ROOM').emit('message',data);
});

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
