import morgan from "morgan";

const express = require('express');
const app = express();
const cors = require('cors');
import history from 'connect-history-api-fallback';
import PitchStats from "./models/PitchStats";

// routes
import pitchStatsRoutes from './routes/api/pitchStats';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import config from "./config";

const {MONGO_URI, URL} = config;


app.use(history());

// Logger Middleware
app.use(morgan('dev'));
// Bodyparser Middleware
app.use(bodyParser.json());

const db = `${MONGO_URI}`;


mongoose
    .connect(db, {
        dbName: "eliteMarketing",
        useNewUrlParser: true,
        useUnifiedTopology: true
    }) // Adding new mongo url parser
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Use Routes
app.use('/api/pitchStats', pitchStatsRoutes);

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


io.on("connection", async (socket) => {
    const stats = await PitchStats.find()
    console.log("clientConnected");
    // receive a message from the client
    socket.emit('initial', stats);

    socket.on("message", async (newData) => {
        // Get the data from mongoDB
        console.log("client send received")
        console.log("beforeUpdate", newData)

        // Update the existing document with the new data
        let filter = { _id: newData._id };
        let update = { $set: newData };
        let options = { new: true };

        let doc = await PitchStats.findOneAndUpdate(filter, update, options);
        console.log(doc)
        io.emit("statsUpdate", doc)
    });

    // Send an update to that one client


    socket.on("updateBackend", () => {
        // Edit the mongoDB record

        // Emit a message to all connected clients with the updated stats
    })
});
