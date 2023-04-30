import {Schema, model} from 'mongoose';
import {RoundSchema} from "./Round";
import {PlayerSchema} from './Player'

// Create Schema
export const EventSchema = new Schema({
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'},
        status: {
            type: String
        },
        eventName: {
            type: String
        },
        startDate: Date,
        numberOfPlayers: Number,
        playerList: [PlayerSchema],
        removedPlayers: [PlayerSchema],
        settings: {
            eventFormat: String,
            manualMode: Boolean,
            game: String,
            gameFormat: String,
            numberOfRounds: Number,
            matchmakingAlgorithm: {
                type: String
            },
            gamesToWin: {
                type: Number
            },
            defaultPodSize: {type: Number},
            roundTime: {
                minutes: {type: Number},
                seconds: {type: Number}
            }
        },
        currentRound: RoundSchema,
        pastRounds: [RoundSchema],
        nameStrings: {
            type: Object
        },
    },
    {minimize: false});

const Event = model('Event', EventSchema, 'events');

export default Event;
