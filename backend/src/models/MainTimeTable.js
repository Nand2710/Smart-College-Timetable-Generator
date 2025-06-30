import mongoose from "mongoose";

const mainTimeTableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class', // References Class
    required: true
  },
  week: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
      },
      timetable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DayTimeTable', // References DayTimeTable
        required: true
      }
    }
  ],
  subjectTeacherBindings: [
    {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      type: {
        type: String,
        enum: ['lecture', 'practical'],
        required: true
      },
      total: {
        type: Number,
        required: true // Total number of lectures or practicals in a week
      },
      max: {
        type: Number,
        required: true // Maximum lectures/practicals a teacher can take per day
      }
    }
  ]
});

export default mongoose.model('MainTimeTable', mainTimeTableSchema);
