import {model, Schema} from 'mongoose'
import User from "./User";

export const PitchStatsSchema = new Schema(
    {
        yesCount: Number,
        noCount: Number,
        streamGoal: Number,
        streamGoalProgress: Number,
    }
)

const PitchStats = model('PitchStats', PitchStatsSchema, 'pitchStats');

export default PitchStats;
