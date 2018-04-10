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
  //this section will have one or more event listeners that line up with various things that can happen on the client side (like sending a message in a chat app)
	socket.on('myEvent', myEventHandler);
	function myEventHandler(data){
		//what you do in response to the event goes here
    //often you'll want one of the four events listed below
	}
}
```

**Server Side Cheat Sheet**
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

#### Client Side
On the client side, the socket.io client library needs to be included in the HTML:
```<script src= 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js'></script>```
And the following line needs to be included at the top of your client.js file:
```javascript
var socket = io()
```
The client can then send messages to the server in the following form
```javascript
//the function takes a string and then an object full of data (any size)
socket.emit('nameOfEvent', {data: "data you are sending to the server"})
```
And the client can listen for messages from the server like so:
```javascript
socket.on('nameOfServerEvent', function(data){
  //the code you want to use on the data sent back from the server
}
```
For example a chat app might send a new message to the server like so:
```javascript
socket.emit('newMsg', {username:username, msg:msg});
```

