import {Schema, model} from 'mongoose';

// Create Schema
export const PlayerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    record: [
        {
            gamesWon: Number,
            gamesPlayed: Number,
            podNumber: {},
            matchWin: Boolean,
            matchTie: Boolean,
            matchLoss: Boolean,
        }
    ],
    rank: Number,
    trueRank: Number,
    points: Number,
    winsLossesDraws: String,
    opponentMatchWinPercentage: Number,
    gameWinPercentage: Number,
    opponentGameWinPercentage: Number,
    roundAdded: Number,
    roundRemoved: Number,
    status: String
});

const Player = model('Player', PlayerSchema, 'users');

export default Player;