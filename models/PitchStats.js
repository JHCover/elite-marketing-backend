import {model, Schema} from 'mongoose'
import User from "./User";

export const PitchStatsSchema = new Schema(
    {
        pitchStats: {type: Object}
    }
)

const PitchStats = model('PitchStats', PitchStatsSchema, 'pitchStats');

export default PitchStats;
