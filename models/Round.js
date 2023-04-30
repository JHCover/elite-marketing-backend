import {Schema} from 'mongoose'
import {PlayerSchema} from "./Player";

export const RoundSchema = new Schema(
    {
        roundNumber: {type: Number},
        roundPairings: {
            columns: {
                type: Object
            },
            benchedList: {
                id: {
                    type: String
                },
                playerIds: {
                    type: Array,
                    of: String
                },
            },
            columnOrder: {type: Array},
        },
        roundStarted: {
            type: Boolean
        },
        playerNamesArrays: {
            type: Array
        },
        benchedNamesString: {
            type: String
        },
        editScoresMode: {
            type: Boolean
        },
        frozen: {
            type: Boolean
        }
    },
    {minimize: false},
    {strict: false}
)

