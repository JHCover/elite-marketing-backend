import {model, Schema} from 'mongoose'

export const PitchStatsSchema = new Schema(
    {
        yesCount: Number,
        noCount: Number,
        streamGoal: Number,
        streamGoalProgress: Number,
        displayGoal: Boolean,
    }
)

const PitchStats = model('PitchStats', PitchStatsSchema, 'pitchStats');

export default PitchStats;
