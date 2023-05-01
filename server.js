const express = require('express');
const app = express();
const cors = require('cors');

const corsOptions = {
    origin: '*', // replace with your domain name, or '*' to allow all origins
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors(corsOptions));

// your Socket.IO server code here

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

io.on("connection", (socket) => {
    // send a message to the client
    socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

    // receive a message from the client
    socket.on("hello from client", (...args) => {
        console.log("hello from client")
    });
});
