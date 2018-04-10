Welcome to Glitch 
================

Click `Show` in the header to see your app live. Updates to your code will instantly deploy and update live.


Socket.io Cheat Sheet
====================

#### Server Side
Just about all of your socket.io programs are going to want the following boilerplate in the server.js file.
```javascript
var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

//This function will be called whenever a new web browser visits the page. It runs as soon as a connection is set up with the server.
function newConnection(socket){
	console.log('new connection: ' + socket.id)
	//we put all the rest of our code inside that connection, because we only want it to run once we're connected
  //this section 
	socket.on('myEvent', myResponse);
	function myEventHandler(data){
		//what you do in response to the event goes here
    //often you'll want one of the four events listed below
	}
}
```


```javascript
// sending to sender-client only
  socket.emit('message', "this is a test");

 // sending to all clients, include sender
  io.emit('message', "this is a test");

 // sending to all clients except sender
  socket.broadcast.emit('message', "this is a test");

 // sending to individual socketid
  socket.broadcast.to(socketid).emit('message', 'for your eyes only');
```