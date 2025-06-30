import Class from '../models/Class.js';

export const createClass = async (req, res) => {
    try {
        const { name } = req.body;

        const existingClass = await Class.findOne({ name });
        if (existingClass) {
            return res.json({ success: false, message: 'Class with this name already exists' });
        }

        const newClass = new Class({
            name
        });

        await newClass.save();
        return res.json({ success: true, newClass });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('students', 'name email')
            .populate('timetable');
        return res.json({ success: true, classes });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const getClassById = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id)
            .populate('students', 'name email')
            .populate('timetable');

        if (!classData) {
            return res.json({ success: false, message: 'Class not found' });
        }

        return res.json({ success: true, classData });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const updateClass = async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);

        if (!classData) {
            return res.json({ success: false, message: 'Class not found' });
        }

        const { name, department, students, timetable } = req.body;

        classData.name = name || classData.name;
        classData.department = department || classData.department;
        classData.students = students || classData.students;
        classData.timetable = timetable || classData.timetable;

        await classData.save();
        return res.json({ success: true, classData });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const deleteClass = async (req, res) => {
    try {
        const classData = await Class.findByIdAndDelete(req.params.id);

        if (!classData) {
            return res.json({ success: false, message: 'Class not found' });
        }

        return res.json({ success: true, message: 'Class removed successfully' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};