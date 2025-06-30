import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'principal'],
    required: true
  },
  
  // Additional fields for teacher/student specifics
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: function () {
        return this.role === 'teacher';
      }
    }
  ],

  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: function () {
      return this.role === 'student';
    }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);