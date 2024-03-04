let express = require('express'); 
let app = express();
let server = app.listen(process.env.PORT || 3000);
app.use(express.static('public'));
console.log('server running')
let socket = require('socket.io');
let io = socket(server, {
  //this allows external websites to connect
  cors: {
    origin: true
  },
  //this allows older socket versions to connect
  allowEIO3: true
});

io.sockets.on('connection', newConnection);

function newConnection(socket){
  socket.on("sendMessage", function(message){
    io.emit("sendMessage", message)
  })
  // socket.on("newMsg", function(data){
  // //send a message to everyone
  //   io.emit("newMsgFromServer", data)
  // //send a message to just the person who sent the original
  //   socket.emit("newMsgFromServer", data)
  // })
  
}