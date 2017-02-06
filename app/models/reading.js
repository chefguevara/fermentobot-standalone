import mongoose from 'mongoose';

let Schema = mongoose.Schema,
    ReadingSchema = new Schema({
        time: Date,
        profile: String,
        appId: {type: String, index: true},
        value: Number,
        humidity: Boolean,
        status: String
    }),
    model = mongoose.model('readings', ReadingSchema);

export { model as default };
