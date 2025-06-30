import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true,
    },
    isBreak: {
        type: Boolean,
        required: true,
        default: false,
    },
    breakType: {
        type: String,
        required: [function () { return this.isBreak; }, 'Break type is required if it is a break.'],
        default: null,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References Teacher
        required: [function () { return !this.isBreak; }, 'Teacher is required if it is not a break.'],
        default: null,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject', // References Subject
        required: [function () { return !this.isBreak; }, 'Subject is required if it is not a break.'],
        default: null,
    },
    type: {
        type: String,
        required: [function () { return !this.isBreak; }, 'Type is required if it is not a break.'],
        default: null,
    },
});

export default mongoose.model('TimeSlot', timeSlotSchema);
