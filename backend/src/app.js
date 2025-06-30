import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/user.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import classRoutes from './routes/class.routes.js';
import contactRoutes from './routes/contact.routes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-generator')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


app.get("/", (req, res) => {
    res.send("backend Working")
})

// Routes
app.use('/api/users', userRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/contacts', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.stack ? err.stack : {}
    });
});

export default app;