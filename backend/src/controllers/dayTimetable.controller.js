import DayTimeTable from "../models/DayTimetable";

export const createDayTimetable = async (req, res) => {
    try {
        const { class: classId, day, slots } = req.body;

        const dayTimetable = new DayTimeTable({
            class: classId,
            day,
            slots
        });

        await dayTimetable.save();
        res.status(201).json(dayTimetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getDayTimetable = async (req, res) => {
    try {
        const { classId, day } = req.params;

        const dayTimetable = await DayTimeTable.findOne({ class: classId, day })
            .populate("slots")
            .populate("class");

        if (!dayTimetable) {
            return res.status(404).json({ message: "Day Timetable not found" });
        }

        res.status(200).json(dayTimetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const updateDayTimetable = async (req, res) => {
    try {
        const { classId, day } = req.params;
        const { slots } = req.body;

        const updatedDayTimetable = await DayTimeTable.findOneAndUpdate(
            { class: classId, day },
            { $set: { slots } },
            { new: true }
        )
            .populate("slots")
            .populate("class");

        if (!updatedDayTimetable) {
            return res.status(404).json({ message: "Day Timetable not found" });
        }

        res.status(200).json(updatedDayTimetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const deleteDayTimetable = async (req, res) => {
    try {
        const { classId, day } = req.params;

        const deletedDayTimetable = await DayTimeTable.findOneAndDelete({
            class: classId,
            day
        });

        if (!deletedDayTimetable) {
            return res.status(404).json({ message: "Day Timetable not found" });
        }

        res.status(200).json({ message: "Day Timetable deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
