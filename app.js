import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import config from './config';
import "regenerator-runtime/runtime.js";
import history from 'connect-history-api-fallback';

// routes
import pitchStatsRoutes from './routes/api/pitchStats';

const { MONGO_URI, URL } = config;

const app = express();

// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "default-src  'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'https://js.stripe.com/v3/'");
//     return next();
// });

app.use(history());

// CORS Middleware
app.use(cors({
    origin: `localhost:3000`
}));
// Logger Middleware
app.use(morgan('dev'));
// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config
const db = `${MONGO_URI}`;

const PitchStats = mongoose.model('PitchStats', pitchStatsSchema);

// Connect to Mongob
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

// Serve static assets if in production
// console.log(process.env)
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/build')))

    app.get('/*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client/build/index.html'));
    });
}

export default app;
