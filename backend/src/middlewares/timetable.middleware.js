// Validate weekly setup input
export const validateWeeklySetup = (req, res, next) => {
    const { bindings } = req.body;

    // Check if bindings exist
    if (!bindings || !Array.isArray(bindings) || bindings.length === 0) {
        return res.status(400).json({ message: 'Invalid bindings' });
    }

    // Validate each binding
    for (const binding of bindings) {
        if (!binding.subject || !binding.teacher || !binding.type) {
            return res.status(400).json({ message: 'Each binding must have subject, teacher, and type' });
        }

        // Validate total slots
        if (!binding.total || binding.total <= 0) {
            return res.status(400).json({ message: 'Invalid total slots' });
        }

        // Validate max daily slots
        if (!binding.max || binding.max <= 0) {
            return res.status(400).json({ message: 'Invalid max daily slots' });
        }
    }

    next();
};

// Validate daily timetable input
export const validateDailyTimetable = (req, res, next) => {
    const { day, slots } = req.body;

    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!day || !validDays.includes(day)) {
        return res.json({
            success: false,
            message: 'Invalid day'
        });
    }

    // Validate slots
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
        return res.json({
            success: false,
            message: 'No slots provided'
        });
    }

    // Check for duplicate teacher assignments
    const teacherAssignments = {};

    const filteredSlots = slots.filter((slot) => slot.isBreak !== true)

    for (const slot of filteredSlots) {
        // Validate each slot has required fields
        if (!slot.subject || !slot.teacher || !slot.type) {
            return res.json({
                success: false,
                message: 'Each slot must have subject, teacher, and type'
            });
        }

        // Validate slot types
        const validTypes = ['lecture', 'practical'];
        if (!validTypes.includes(slot.type)) {
            return res.json({
                success: false,
                message: 'Invalid slot type'
            });
        }
    }

    next();
};

