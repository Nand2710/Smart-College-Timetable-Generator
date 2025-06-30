import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  teachers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
    }
  ]
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);