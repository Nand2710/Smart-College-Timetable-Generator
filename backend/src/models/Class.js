import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Ensure each class has a unique name
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // References the User model for student details
        }
    ],
    timetable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainTimeTable' // References the Timetable model for this class
    }
}, { timestamps: true });

export default mongoose.model('Class', classSchema);
