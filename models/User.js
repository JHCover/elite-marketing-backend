import { Schema, model } from 'mongoose';

// Create Schema
export const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
    },
    subExpireDate: {
        type: Date,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    confEmailLastSent: {
        type: Date
    },
    lastConfirmationTokenCreated: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    passwordResetEmailLastSent: {
        type: Date
    },
    register_date: {
        type: Date,
        default: Date.now
    },
    eventsDetails: [{
        eventName: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        },
        game: {
            type: String,
        },
        eventFormat: {
            type: String,
        },
        gameFormat: String,
        numberOfPlayers: {
            type: Number,
            default: 0
        },
        currentRound: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        date: {
            type: Date,
            default: Date.now
        },
        event: {type: Schema.Types.ObjectId, ref: 'Event'}
    }],

}, { minimize: false });

const User = model('User', UserSchema, 'users');

export default User;
