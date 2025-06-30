import express from "express";
import { createDayTimetable, getDayTimetable, updateDayTimetable, deleteDayTimetable } from "../controllers/dayTimetable.controller"; // Adjust the path to your controller if needed

const router = express.Router();

// **Create a new Day Timetable**
router.post("/", createDayTimetable);

// **Get Day Timetable for a specific class and day**
router.get("/:classId/:day", getDayTimetable);

// **Update Day Timetable for a specific class and day**
router.put("/:classId/:day", updateDayTimetable);

// **Delete Day Timetable for a specific class and day**
router.delete("/:classId/:day", deleteDayTimetable);

export default router;
