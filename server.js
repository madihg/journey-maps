const express = require('express');
const app = express();
const server = app.listen(process.env.PORT || 3000, () => console.log('Server running'));
app.use(express.static('public'));

const socket = require('socket.io');
const io = socket(server, {
    cors: {
        origin: "*",
    },
});

io.on('connection', (socket) => {
    socket.on('drawLine', (point) => {
        socket.broadcast.emit('drawLine', point); // Broadcast to all except the sender
    });
});
