import express from 'express';
import TimetableController from '../controllers/timetable.controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { validateDailyTimetable, validateWeeklySetup } from '../middlewares/timetable.middleware.js';

const router = express.Router();

// Get subject-teacher bindings for a specific class
router.get(
  '/bindings/:classId',
  [authMiddleware, adminMiddleware],
  TimetableController.getSubjectTeacherBindings
);

// Save weekly setup (subject-teacher bindings)
router.post(
  '/weekly-setup/:classId', [authMiddleware, adminMiddleware], validateWeeklySetup,
  TimetableController.saveWeeklySetup
);

// Save daily timetable
router.post(
  '/daily/:classId',
  [authMiddleware, adminMiddleware],
  validateDailyTimetable,
  TimetableController.saveDayTimetable
);

// Get weekly timetable overview
router.get(
  '/overview/:classId',
  authMiddleware,
  TimetableController.getWeeklyTimetableOverview
);

router.get(
  '/:classId/full',
  authMiddleware,
  TimetableController.getFullTimetable 
);


router.get(
  '/:classId/:day',
  authMiddleware,
  TimetableController.getDayTimetable 
);


// Get timetable summary for submission
router.get(
  '/summary/:classId',
  [authMiddleware, adminMiddleware],
  TimetableController.getTimetableSummary
);

// Submit and lock timetable
router.post(
  '/submit/:classId',
  [authMiddleware, adminMiddleware],
  TimetableController.submitTimetable
);

export default router;