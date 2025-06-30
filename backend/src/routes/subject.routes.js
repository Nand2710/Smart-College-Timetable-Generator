import express from 'express';
import {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} from '../controllers/subject.controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to create a new subject (Admin Only)
router.post('/', [authMiddleware, adminMiddleware], createSubject);

// Route to get all subjects (Admin or Public depending on requirements)
router.get('/', getAllSubjects);

// Route to get a specific subject by ID
router.get('/:id', authMiddleware, getSubjectById);

// Route to update a subject (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware], updateSubject);

// Route to delete a subject (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], deleteSubject);

export default router;
