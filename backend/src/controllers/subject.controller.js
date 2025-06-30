import Subject from '../models/Subject.js';

export const createSubject = async (req, res) => {
    try {
        const { name, code, department, credits } = req.body;

        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.json({ success: false, message: 'Subject with this code already exists' });
        }

        const newSubject = new Subject({
            name,
            code,
            department,
            credits
        });

        await newSubject.save();
        return res.json({ success: true, newSubject });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        return res.json({ success: true, subjects });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.json({ success: false, message: 'Subject not found' });
        }

        return res.json({ success: true, subject });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.json({ success: false, message: 'Subject not found' });
        }

        const { name, code } = req.body;

        subject.name = name || subject.name;
        subject.code = code || subject.code;

        await subject.save();
        return res.json({ success: true, subject });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.json({ success: false, message: 'Subject not found' });
        }

        return res.json({ success: true, message: 'Subject removed' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};