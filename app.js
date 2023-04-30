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
import authRoutes from './routes/api/auth';
import userRoutes from './routes/api/users';
import eventRoutes from './routes/api/events';
import playerRoutes from './routes/api/players';
import podRoutes from './routes/api/pods';
import roundRoutes from './routes/api/rounds';
import guestRoutes from './routes/api/guests';
import stripeRoutes  from './routes/api/stripe';

const { MONGO_URI, URL } = config;

const app = express();

// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "default-src  'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'https://js.stripe.com/v3/'");
//     return next();
// });

app.use(history());

// CORS Middleware
app.use(cors({
    origin: `${URL}`
}));
// Logger Middleware
app.use(morgan('dev'));
// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config
const db = `${MONGO_URI}`;

// Connect to Mongob
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }) // Adding new mongo url parser
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/pods', podRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/stripe', stripeRoutes);

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
