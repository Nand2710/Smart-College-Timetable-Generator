import mongoose from 'mongoose';

const dayTimeTableSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },
    slots: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TimeSlot',
            required: true
        }
    ]
});
const DayTimeTable = mongoose.models?.DayTimeTable || mongoose.model('DayTimeTable', dayTimeTableSchema);






export default DayTimeTable;

