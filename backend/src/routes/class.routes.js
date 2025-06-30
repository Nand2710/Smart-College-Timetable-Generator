import express from 'express';
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass
} from '../controllers/class.controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to create a new class (Admin Only)
router.post('/', [authMiddleware, adminMiddleware], createClass);

// Route to get all classes (Accessible by Admin/Teachers)
router.get('/', getAllClasses);

// Route to get a specific class by ID (Accessible by Admin/Teachers)
router.get('/:id', authMiddleware, getClassById);

// Route to update a class by ID (Admin Only)
router.put('/:id', [authMiddleware, adminMiddleware], updateClass);

// Route to delete a class by ID (Admin Only)
router.delete('/:id', [authMiddleware, adminMiddleware], deleteClass);

export default router;
