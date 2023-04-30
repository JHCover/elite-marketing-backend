import {Schema, model} from 'mongoose';

// Create Schema
export const GuestSchema = new Schema({
    event: {type: Schema.Types.ObjectId, ref: 'Event'}
}, {minimize: false});

const Guest = model('Guest', GuestSchema, 'guests');

export default Guest;
