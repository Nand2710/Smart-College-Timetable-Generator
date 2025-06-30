import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getAllTeachers,
  getAllStudents,
  deleteUser,
  getDashboardData,
  getAllAdmins,
  getAllPrincipals,
  getTeacherDashboardData,
  getPrincipalDashboardData
} from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/teachers', authMiddleware, getAllTeachers);
router.get('/teachers/dashboard', authMiddleware, getTeacherDashboardData);
router.get('/principal/dashboard', authMiddleware, getPrincipalDashboardData);
router.get('/students', authMiddleware, getAllStudents);
router.get('/admins', authMiddleware, getAllAdmins);
router.get('/principals', authMiddleware, getAllPrincipals);
router.get('/admin', [authMiddleware, adminMiddleware], getDashboardData);
router.get('/:id', [authMiddleware, adminMiddleware], deleteUser);

export default router;