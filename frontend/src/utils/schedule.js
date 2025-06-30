class TimetableGenerator {
    constructor(bindings, dailyTimeSlots, weekDays) {
        // Deep copy and preprocess bindings with additional tracking
        this.bindings = bindings.map(binding => ({
            ...binding,
            totalSlots: binding.type === 'practical' ? binding.total * 2 : binding.total,
            remainingSlots: binding.type === 'practical' ? binding.total * 2 : binding.total,
            originalTotal: binding.type === 'practical' ? binding.total * 2 : binding.total
        }));

        this.dailyTimeSlots = dailyTimeSlots;
        this.weekDays = weekDays;
        this.weeklyTimetable = {};
    }

    // Enhanced shuffle method to ensure randomization
    shuffleArray(array) {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }

    // Find available non-break slots with enhanced validation
    findAvailableSlots() {
        return this.dailyTimeSlots
            .filter(slot => !slot.isBreak)
            .map(slot => slot);
    }


    canPlacePractical(availableSlots, startIndex) {
        // Ensure we have enough consecutive non-break slots
        if (startIndex >= availableSlots.length - 1) return false;

        const firstSlot = availableSlots[startIndex];
        const secondSlot = availableSlots[startIndex + 1];

        // Check that:
        // 1. Neither slot is a break
        // 2. There are no breaks between these two slots
        // 3. Not the last slots before a break
        const slotsInBetween = this.dailyTimeSlots.slice(
            this.dailyTimeSlots.findIndex(slot => slot.id === firstSlot.id) + 1,
            this.dailyTimeSlots.findIndex(slot => slot.id === secondSlot.id)
        );

        return !firstSlot.isBreak &&
            !secondSlot.isBreak &&
            !slotsInBetween.some(slot => slot.isBreak);
    }

    // Check if the current slot is the last before a break
    isLastSlotBeforeBreak(availableSlots, index) {
        // If this is the last available slot or next slot is a break
        return index === availableSlots.length - 1 ||
            this.dailyTimeSlots.find(slot =>
                slot.id === availableSlots[index + 1].id && slot.isBreak
            );
    }

    // Enhanced allocation method to fill all slots
    generateDayTimetable(day, remainingBindings) {
        const dayTimetable = [];
        const availableSlots = this.findAvailableSlots();
        const dayBindings = this.shuffleArray([...remainingBindings]);

        // Tracking allocations with more flexible constraints
        const dailySubjectAllocation = {};
        const dailyTeacherAllocation = {};

        for (let i = 0; i < availableSlots.length; i++) {
            // Broader eligibility criteria
            const eligibleBindings = dayBindings.filter(b => {
                const subjectAllocated = dailySubjectAllocation[`${b.subject}__${b.type}`] || 0;

                return b.remainingSlots > 0 && (
                    // More lenient subject allocation
                    subjectAllocated < (b.max * (b.type === 'practical' ? 2 : 1))
                );
            });

            // If no eligible bindings, try forcing allocation
            if (eligibleBindings.length === 0) {
                // Reset tracking to allow more allocations
                const forcedEligibleBindings = dayBindings.filter(b => b.remainingSlots > 0);
                if (forcedEligibleBindings.length > 0) {
                    eligibleBindings.push(...forcedEligibleBindings);
                } else {
                    break; // Truly no more slots can be allocated
                }
            }

            // Randomly select a binding
            let binding;
            if (this.canPlacePractical(availableSlots, i)) {
                binding = eligibleBindings[Math.floor(Math.random() * eligibleBindings.length)];
            }

            else {
                const onlyEligibleLecturesBinding = eligibleBindings.filter((b) => b.type === "lecture");

                if (onlyEligibleLecturesBinding.length === 0) {
                    console.log("No lecture bindigs found.");
                    console.log("repeating the scheduling from the starting.");
                    return;
                }

                binding = onlyEligibleLecturesBinding[Math.floor(Math.random() * onlyEligibleLecturesBinding.length)];
            }


            // Practical allocation
            if (binding.type === 'practical') {
                // Limit practicals per day
                // const currentPracticals = dayTimetable.filter(slot => slot.type === 'practical').length;
                // if (currentPracticals >= maxPracticalsPerDay) continue;

                if (this.canPlacePractical(availableSlots, i)) {
                    const firstSlot = availableSlots[i];
                    const secondSlot = availableSlots[i + 1];

                    // Add two consecutive slots for practical
                    dayTimetable.push({
                        time: firstSlot.time,
                        subject: binding.subject,
                        teacher: binding.teacher,
                        type: 'practical',
                        isBreak: false
                    });
                    dayTimetable.push({
                        time: secondSlot.time,
                        subject: binding.subject,
                        teacher: binding.teacher,
                        type: 'practical',
                        isBreak: false
                    });

                    // Update tracking
                    binding.remainingSlots -= 2;
                    dailySubjectAllocation[binding.subject] =
                        (dailySubjectAllocation[binding.subject] || 0) + 1;
                    i++; // Skip next slot
                }
            }
            // Lecture allocation
            else {
                dayTimetable.push({
                    time: availableSlots[i].time,
                    subject: binding.subject,
                    teacher: binding.teacher,
                    type: 'lecture',
                    isBreak: false
                });

                // Update tracking
                binding.remainingSlots--;
                dailySubjectAllocation[`${binding.subject}__${binding.type}`] =
                    (dailySubjectAllocation[`${binding.subject}__${binding.type}`] || 0) + 1;
            }
        }

        // Add break slots to the day's timetable
        const breakSlots = this.dailyTimeSlots.filter(slot => slot.isBreak);
        dayTimetable.push(...breakSlots.map(breakSlot => ({
            time: breakSlot.time,
            isBreak: true,
            breakType: breakSlot.breakType
        })));

        // Sort timetable by time to ensure correct order
        dayTimetable.sort((a, b) => {
            const timeA = this.dailyTimeSlots.findIndex(slot => slot.time === a.time);
            const timeB = this.dailyTimeSlots.findIndex(slot => slot.time === b.time);
            return timeA - timeB;
        });

        // Remove bindings with no remaining slots
        const updatedBindings = dayBindings.filter(b => b.remainingSlots > 0);

        return {
            day,
            timetable: dayTimetable,
            remainingBindings: updatedBindings
        };
    }

    // Generate weekly timetable with comprehensive validation and forced allocation
    generateWeeklyTimetable() {
        const MAX_ATTEMPTS = 100; // Prevent infinite loops
        let attempts = 0;

        while (attempts < MAX_ATTEMPTS) {
            try {
                // Reset the weekly timetable and bindings for each attempt
                this.weeklyTimetable = {};
                let remainingBindings = this.bindings.map(binding => ({
                    ...binding,
                    remainingSlots: binding.type === 'practical' ? binding.total * 2 : binding.total,
                    originalTotal: binding.type === 'practical' ? binding.total * 2 : binding.total
                }));

                for (const day of this.weekDays) {
                    // Prioritize days with more remaining slots in later iterations
                    remainingBindings.sort((a, b) => b.remainingSlots - a.remainingSlots);

                    const dayResult = this.generateDayTimetable(day, remainingBindings);
                    this.weeklyTimetable[day] = dayResult.timetable;
                    remainingBindings = dayResult.remainingBindings;
                }

                // Final check for unallocated slots
                const unallocatedSlots = remainingBindings.reduce((sum, binding) =>
                    sum + binding.remainingSlots, 0);

                if (unallocatedSlots === 0) {
                    return this.weeklyTimetable; // Successful allocation
                }

                attempts++;
            } catch (error) {
                // Silently retry
                attempts++;
            }
        }

        // If max attempts reached without success
        throw new Error('Could not generate a valid timetable after multiple attempts');
    }

    // Enhanced print method to show detailed timetable
    printTimetable() {

        const allocationCounts = {};

        for (const [day, timetable] of Object.entries(this.weeklyTimetable)) {
            console.log(`\n${day} Timetable:`);
            timetable.forEach(slot => {
                if (slot.isBreak) {
                    console.log(`${slot.time}: ${slot.breakType || 'Break'}`);
                } else {
                    console.log(`${slot.time}: ${slot.subject} - ${slot.teacher} (${slot.type})`);
                }


                if (`${slot.subject}__${slot.type}` in allocationCounts) {
                    allocationCounts[`${slot.subject}__${slot.type}`] += 1
                }
                else {
                    allocationCounts[`${slot.subject}__${slot.type}`] = 1
                }
            });
        }


    }
}

// Example usage
const bindings = [
    {
        subject: "Math",
        teacher: "Alice",
        type: "practical",
        total: 6,
        max: 4
    },
    {
        subject: "Physics",
        teacher: "Bob",
        type: "practical",
        total: 6,
        max: 2
    },
    {
        subject: "Chemistry",
        teacher: "Bob2",
        type: "lecture",
        total: 6,
        max: 4
    },
    {
        subject: "Biology",
        teacher: "Charlie",
        type: "practical",
        total: 6,
        max: 4
    }
];

// const dailyTimeSlots = [
//     { id: '1', time: '10:15 AM - 11:15 AM', isBreak: false },
//     { id: '2', time: '11:15 AM - 12:15 PM', isBreak: false },
//     { id: '3', time: '12:15 PM - 1:15 PM', isBreak: false },
//     { id: '4', time: '1:15 PM - 1:45 PM', isBreak: true, breakType: 'Long Break' },
//     { id: '5', time: '1:45 PM - 2:45 PM', isBreak: false },
//     { id: '6', time: '2:45 PM - 3:45 PM', isBreak: false },
//     { id: '7', time: '3:45 PM - 4:00 PM', isBreak: true, breakType: 'Short Break' },
//     { id: '8', time: '4:00 PM - 5:00 PM', isBreak: false },
//     { id: '9', time: '5:00 PM - 6:00 PM', isBreak: false }
// ];

// const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// // Create and run the generator
// const generator = new TimetableGenerator(bindings, dailyTimeSlots, weekDays);
// const weeklyTimetable = generator.generateWeeklyTimetable();

// generator.printTimetable();

export default TimetableGenerator;

