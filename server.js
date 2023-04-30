import app from './app';
import config from './config';
import http from 'http';

var cors = require('cors')
const socketio = require('socket.io');
var fs = require('fs');

const {BACKEND_PORT, URL, } = config;



const server = http.createServer(app);

const io = socketio(server, {
        cors: {
            origins: [`${URL}`],
        }
    }
);


const users = [];

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userJoin(id, clientType, eventId) {
    const user = {id, clientType, eventId};

    users.push(user);

    return user;
}

io.on('connection', socket => {
    // console.log(`Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        const removedUser = userLeave(socket.id);

        if (removedUser && removedUser.clientType === 'control') {
            if (!users.some(user => user.clientType === 'control' && user.eventId === removedUser.eventId)) {
                io.to(removedUser.eventId).emit('noControl')
            }
        }
        // console.log(`Disconnected: ${socket.id}`)
    })

    // Join room and tell control panel to setInitialData for all displays that may be open
    socket.on('joinRoom', ({clientType, eventId}) => {
        // console.log(`${clientType} with socket: ${socket.id} joining ${eventId}`);
        const user = userJoin(socket.id, clientType, eventId);
        socket.join(eventId);
        if (!users.some(user => user.clientType === 'control' && user.eventId === eventId)) {
            // console.log("No control panels connected")
            io.to(eventId).emit('noControl')
        }
    });

    socket.on('controlPanelJoinRoom', ({clientType, eventId}) => {
        // console.log(`${clientType} with socket: ${socket.id} joining ${eventId}`);
        const user = userJoin(socket.id, clientType, eventId);
        socket.join(eventId);
        if (!users.some(user => user.clientType === 'control' && user.eventId === eventId)) {
            // console.log("No control panels connected")
            io.to(eventId).emit('noControl')
        }
    });

    // Listen for Control Updates
    socket.on(['controlPanelChangePairings'], data => {
        const user = getCurrentUser(socket.id);
        io.to(user.eventId).emit('displayChangePairings', data);
    });
    socket.on(['controlPanelChangeScoreSheet'], data => {
        const user = getCurrentUser(socket.id);
        io.to(user.eventId).emit('displayChangeScoreSheet', data);
    });
    socket.on(['controlPanelChangeDetails'], data => {
        const user = getCurrentUser(socket.id);
        io.to(user.eventId).emit('displayChangeDetails', data);
    });
    socket.on(['controlPanelChangeTimer'], data => {
        const user = getCurrentUser(socket.id);
        io.to(user.eventId).emit('displayChangeTimer', data);
    });
})

server.listen(BACKEND_PORT, () => console.log(`Server started on PORT ${BACKEND_PORT}`));

export default server;
