import MainTimeTable from '../models/MainTimeTable.js';
import DayTimeTable from '../models/DayTimetable.js';
import TimeSlot from '../models/TimeSlot.js';
import Class from '../models/Class.js';
import mongoose from 'mongoose';

class TimetableController {
  async getSubjectTeacherBindings(req, res) {
    try {
      const { classId } = req.params;
      const { onlyBindings } = req.query;

      // Check if classId is valid
      if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
        return res.json({ success: false, message: 'Invalid classId' });
      }

      const classDoc = await Class.findById(classId);

      if (!classDoc) {
        return res.json({ success: false, message: 'Class not found' });
      }

      let mainTimeTable;
      if (onlyBindings) {
        mainTimeTable = await MainTimeTable.findOne({
          class: classId
        })
      }
      else {
        mainTimeTable = await MainTimeTable.findOne({
          class: classId
        }).populate({
          path: 'subjectTeacherBindings.subject',
          model: 'Subject', // Populate Subject details
          select: '_id name'
        }).populate({
          path: 'subjectTeacherBindings.teacher',
          model: 'User', // Populate Teacher (User ) details
          select: '_id name'
        });
      }
      const previouslySavedDays = mainTimeTable.week.map((table) => table.day)

      // Check if mainTimeTable is found
      if (!mainTimeTable) {
        return res.json({ success: false, message: "Binding not found." });
      }

      // Safely access subjectTeacherBindings
      const bindings = mainTimeTable.subjectTeacherBindings || [];
      return res.json({ success: true, bindings, savedDays: previouslySavedDays });

    } catch (error) {
      console.error('Error fetching subject-teacher bindings:', error);
      return res.json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async saveWeeklySetup(req, res) {
    try {
      const { classId } = req.params;
      const { bindings } = req.body;

      const totalHours = bindings.reduce((sum, binding) => sum + (binding.total * (binding.type === "practical" ? 2 : 1)), 0);
      if (totalHours !== 42) {
        return res.json({
          success: false,
          message: 'Total allocated hours must be exactly 42'
        });
      }

      const mainTimeTable = await MainTimeTable.findOneAndUpdate(
        { class: classId },
        {
          class: classId,
          subjectTeacherBindings: bindings.map(binding => ({
            subject: binding.subject,
            teacher: binding.teacher,
            type: binding.type,
            total: binding.total,
            max: binding.max
          }))
        },
        { upsert: true, new: true }
      );

      const updatedClass = await Class.findByIdAndUpdate(classId, {
        timetable: mainTimeTable._id
      })


      res.json({
        success: true,
        mainTimeTable
      });
    } catch (error) {
      console.error('Error saving weekly setup:', error);
      res.json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async saveDayTimetable(req, res) {
    try {
      const { classId } = req.params;
      const { day, slots } = req.body;

      const validatedSlots = await Promise.all(slots.map(async (slot) => {
        const timeSlot = new TimeSlot({
          time: slot.time,
          subject: slot.subject ? slot.subject : null,
          teacher: slot.teacher ? slot.teacher : null,
          type: slot.type ? slot.type : null,
          breakType: slot.breakType ? slot.breakType : null,
          isBreak: slot.isBreak ? slot.isBreak : false
        });

        await timeSlot.save();
        return timeSlot._id;
      }));

      const dayTimeTable = await DayTimeTable.findOneAndUpdate(
        { class: classId, day },
        { class: classId, day, slots: validatedSlots },
        { upsert: true, new: true }
      );

      await MainTimeTable.findOneAndUpdate(
        { class: classId },
        { $pull: { week: { day } } } // Remove existing day entry if it exists
      );

      await MainTimeTable.findOneAndUpdate(
        { class: classId },
        { $push: { week: { day, timetable: dayTimeTable._id } } },
        { upsert: true }
      );

      res.json({ success: true, dayTimeTable });
    } catch (error) {
      console.error('Error saving day timetable:', error);
      res.json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async getDayTimetable(req, res) {
    try {
      const { classId, day } = req.params;

      // Step 1: Find the specific day's timetable ID from MainTimeTable
      const mainTimeTable = await MainTimeTable.findOne(
        { class: classId },
        // { class: classId, 'week.day': day },
        // { 'week.$': 1 } // Use positional operator to fetch only the matching day's entry
      ).select('week');

      if (!mainTimeTable || !mainTimeTable.week.length) {
        return res.json({ success: false, message: 'Timetable not found for the specified day' });
      }

      // Extract the timetable ID for the specific day
      const selectedDayTimeTable = mainTimeTable.week.filter((table) => table.day === day);
      const previouslySavedDays = mainTimeTable.week.map((table) => table.day)

      if (selectedDayTimeTable.length === 0) {
        return res.json({ success: false, message: 'Day timetable details not found', data: { savedDays: previouslySavedDays } });
      }


      const dayTimeTableId = selectedDayTimeTable[0].timetable;

      // Step 2: Fetch the DayTimeTable and populate its slots
      const dayTimeTable = await DayTimeTable.findById(dayTimeTableId)
        .populate({
          path: 'slots',
          populate: [
            { path: 'subject', select: 'name code' }, // Populate subject details
            { path: 'teacher', select: 'name email' } // Populate teacher details
          ]
        });

      if (!dayTimeTable) {
        return res.json({ success: false, message: 'Day timetable details not found', data: { savedDays: previouslySavedDays } });
      }

      // Step 3: Return the populated DayTimeTable
      res.json({ success: true, data: { dayTimeTable, savedDays: previouslySavedDays } });
    } catch (error) {
      console.error('Error fetching day timetable:', error);
      res.json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async getWeeklyTimetableOverview(req, res) {
    try {
      const { classId } = req.params;

      const mainTimeTable = await MainTimeTable.findOne({ class: classId })
        .populate({
          path: 'week.timetable',
          populate: {
            path: 'slots',
            populate: [
              { path: 'subject', select: 'name code' },
              { path: 'teacher', select: 'name' },
            ],
          },
        }).populate('class');

      if (!mainTimeTable) {
        return res.json({ success: false, message: 'No timetable found for this class' });
      }

      const classData = mainTimeTable.class;
      const weeklySchedule = mainTimeTable.week.map(dayTimeTable => ({
        day: dayTimeTable.day,
        slots: dayTimeTable.timetable.slots.map(slot => ({
          time: slot.time,
          subject: slot?.subject?.name,
          teacher: slot?.teacher?.name,
          type: slot.type
        }))
      }));

      res.json({ success: true, data: { weeklySchedule, classData } });
    } catch (error) {
      console.error('Error fetching weekly timetable:', error);
      res.json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async getFullTimetable(req, res) {
    try {
      const { classId } = req.params;

      // Step 1: Find the MainTimeTable for the class
      const mainTimeTable = await MainTimeTable.findOne({ class: classId })
        .populate({
          path: 'week.timetable',
          populate: {
            path: 'slots',
            populate: [
              { path: 'subject', select: 'name' }, // Populate subject name
              { path: 'teacher', select: 'name' }  // Populate teacher name
            ]
          }
        }).populate('class');


      const classData = mainTimeTable.class;

      if (!mainTimeTable) {
        return res.json({ success: false, message: 'No timetable found for the specified class' });
      }

      // Step 2: Transform the timetable data to a readable format
      const weeklySchedule = mainTimeTable.week.map(dayEntry => ({
        day: dayEntry.day,
        slots: dayEntry.timetable.slots.map(slot => ({
          _id: slot._id,
          time: slot.time,
          subject: slot?.subject?.name,
          teacher: slot?.teacher?.name,
          type: slot.type
        }))
      }));

      // Step 3: Send the response
      res.json({ success: true, data: { weeklySchedule, classData } });

    } catch (error) {
      console.error('Error retrieving full timetable:', error);
      res.json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async getTimetableSummary(req, res) {
    try {
      const { classId } = req.params;

      const mainTimeTable = await MainTimeTable.findOne({ class: classId })
        .populate({
          path: 'subjectTeacherBindings.subject',
          select: 'name'
        })
        .populate({
          path: 'subjectTeacherBindings.teacher',
          select: 'name'
        })
        .populate({
          path: 'week.timetable',
          populate: {
            path: 'slots',
            populate: [
              { path: 'subject', select: 'name' },
              { path: 'teacher', select: 'name' },
            ],
          },
        });

      if (!mainTimeTable) {
        return res.json({ success: false, message: 'No timetable found for this class' });
      }

      const subjectSummary = mainTimeTable.subjectTeacherBindings.map(binding => {
        const allocatedSlots = mainTimeTable.week.reduce((total, dayEntry) => {
          const daySlots = dayEntry.timetable.slots.filter(
            slot => slot.subject._id.toString() === binding.subject._id.toString()
          ).length;
          return total + daySlots;
        }, 0);

        return {
          subject: binding?.subject?.name,
          total: binding.total,
          allocatedSlots,
          type: binding.type
        };
      });

      const teacherSummary = mainTimeTable.subjectTeacherBindings.map(binding => {
        const allocatedSlots = mainTimeTable.week.reduce((total, dayEntry) => {
          const daySlots = dayEntry.timetable.slots.filter(
            slot => slot.teacher._id.toString() === binding.teacher._id.toString()
          ).length;
          return total + daySlots;
        }, 0);

        return {
          teacher: binding?.teacher?.name,
          max: binding.max,
          allocatedSlots
        };
      });

      const unallocatedSlots = mainTimeTable.week.flatMap(dayEntry =>
        dayEntry.timetable.slots.length < 7
          ? [{ day: dayEntry.day, remainingSlots: 7 - dayEntry.timetable.slots.length }]
          : []
      );

      res.json({
        success: true,
        subjectSummary,
        teacherSummary,
        unallocatedSlots
      });
    } catch (error) {
      console.error('Error fetching timetable summary:', error);
      res.json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async submitTimetable(req, res) {
    try {
      const { classId } = req.params;

      const mainTimeTable = await MainTimeTable.findOne({ class: classId });

      if (!mainTimeTable) {
        return res.json({ success: false, message: 'No timetable found for this class' });
      }

      mainTimeTable.isLocked = true;
      await mainTimeTable.save();

      res.json({
        success: true,
        message: 'Timetable successfully submitted and locked',
        timetableId: mainTimeTable._id
      });
    } catch (error) {
      console.error('Error submitting timetable:', error);
      res.json({ success: false, message: 'Server error', error: error.message });
    }
  }
}

export default new TimetableController();