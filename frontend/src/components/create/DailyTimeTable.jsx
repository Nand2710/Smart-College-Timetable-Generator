import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../ui/select';
import { create } from '../../utils/api';
import { ForwardIcon } from 'lucide-react';
import { dailyTimeSlots } from '../../constants';

// Icons for visual improvements
const PracticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h10" />
    </svg>
);

const LectureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" x2="12" y1="12" y2="16" />
    </svg>
);

const DailyTimetable = () => {
    const { classId, dayName } = useParams();
    const navigate = useNavigate();

    // Capitalize first letter of day
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const [day, setDay] = useState(capitalizedDayName);
    const [savedDays, setSavedDays] = useState([])

    // State management
    const [subjectTeacherBindings, setSubjectTeacherBindings] = useState([]);
    const [weeklyTimeSlots, setWeeklyTimeSlots] = useState({
        Monday: dailyTimeSlots.map(slot => ({ ...slot, subject: '', teacher: '', type: '' })),
        Tuesday: dailyTimeSlots.map(slot => ({ ...slot, subject: '', teacher: '', type: '' })),
        Wednesday: dailyTimeSlots.map(slot => ({ ...slot, subject: '', teacher: '', type: '' })),
        Thursday: dailyTimeSlots.map(slot => ({ ...slot, subject: '', teacher: '', type: '' })),
        Friday: dailyTimeSlots.map(slot => ({ ...slot, subject: '', teacher: '', type: '' })),
        Saturday: dailyTimeSlots.map(slot => ({ ...slot, subject: '', teacher: '', type: '' })),
    });

    // Fetch subject-teacher bindings
    const fetchBindings = async () => {
        try {
            const bindingsData = await create.getBindings(classId);

            if (bindingsData.success) {
                setSubjectTeacherBindings(bindingsData.bindings);
            } else {
                toast.error(bindingsData.message);
            }
        } catch (error) {
            toast.error("Unable to fetch subject-teacher bindings");
        }
    };


    // Fetch existing day timetable
    const fetchDayData = async () => {
        try {
            const response = await create.getDayTimetable(classId, day);


            if (response?.data?.savedDays) {
                setSavedDays(response?.data?.savedDays)
            }


            if (response.success && response?.data?.dayTimeTable?.slots) {
                setWeeklyTimeSlots((prev) => ({
                    ...prev,
                    [day]: response?.data.dayTimeTable.slots
                }));
            }
        } catch (error) {
            console.log(error);
            // toast.error("Error fetching day timetable");
        }
    };

    // Validation for weekly slot allocation
    const validateSlotAllocation = (binding, currentAllocatedSlots, currentType) => {
        const totalSlots = binding.total;
        const allocatedSlots = currentAllocatedSlots;

        if (allocatedSlots > (totalSlots * currentType === "practical" ? 2 : 1)) {
            toast.error(`Slot limit exceeded for ${binding.subject.name}. Adjust your schedule.`);
            return false;
        }
        return true;
    };


    const areAllDaysSaved = () => {

        const allDays = [
            "Friday",
            "Monday",
            "Saturday",
            "Thursday",
            "Tuesday",
            "Wednesday"
        ]
        if (!savedDays) {
            return false;
        }
        const sortedSavedDays = savedDays.sort()

        if (sortedSavedDays.length !== 6) {
            return false;
        }
        for (let i = 0; i < 6; i++) {
            if (allDays[i] !== sortedSavedDays[i]) {
                return false;
            }
        }
        return true
    }
    // Handle slot updates with comprehensive validation
    const handleSlotUpdate = (slotIndex, field, value) => {
        const updatedSlots = [...weeklyTimeSlots[day]];
        const currentSlot = updatedSlots[slotIndex];

        // Validate step-by-step selection flow
        if (field === 'type') {
            // Reset subject and teacher when type changes
            if (value === "lecture" && currentSlot.type === "practical") {

                if (slotIndex + 1 < updatedSlots.length) {
                    updatedSlots[slotIndex + 1] = {
                        ...updatedSlots[slotIndex + 1],
                        type: '',
                        subject: '',
                        teacher: ''
                    };
                }
            }
            currentSlot.type = value
            currentSlot.subject = '';
            currentSlot.teacher = '';
        }

        if (field === 'subject') {
            // Auto-select first available teacher for the subject and type
            const availableTeachers = getFilteredTeachers(slotIndex, value);

            currentSlot.subject = value
            currentSlot.teacher = availableTeachers.length > 0 ? availableTeachers[0]._id : '';
        }

        if (field === 'teacher') {
            currentSlot.teacher = value
        }

        // Update the current slot
        updatedSlots[slotIndex] = { ...currentSlot, [field]: value };

        // Practical slot handling
        if (field === 'type' && value === 'practical') {
            // Validate practical slot allocation
            if (slotIndex === 8) { // Last slot before end of day
                toast.error("Practical cannot be assigned in the last hour");
                return;
            }

            // Validate practical slot allocation
            else if (slotIndex === 2 || slotIndex === 5) { // Last slot before end of day
                toast.error("Practical cannot be assigned before break.");
                return;
            }

        }
        // Ensure practical spans two consecutive slots
        if (value === "practical" || currentSlot.type === "practical") {

            if (slotIndex + 2 === 2 && updatedSlots[slotIndex + 2].type === "practical") {
                updatedSlots[slotIndex + 2] = {
                    ...updatedSlots[slotIndex + 2],
                    type: 'lecture'
                };
            }
            if (slotIndex + 1 < updatedSlots.length) {
                updatedSlots[slotIndex + 1] = {
                    ...updatedSlots[slotIndex + 1],
                    type: 'practical',
                    subject: currentSlot.subject,
                    teacher: currentSlot.teacher
                };
            }
        }

        // Find the binding for the current slot
        const binding = subjectTeacherBindings.find(
            b => b.subject._id === currentSlot.subject &&
                b.type === currentSlot.type
        );

        if (binding) {
            // Count existing slots for this subject and type
            // const existingSlots = updatedSlots.filter(
            //     slot => (slot.subject === currentSlot.subject &&
            //         slot.type === currentSlot.type)
            // ).length;

            // // Validate slot allocation
            // if (!validateSlotAllocation(binding, existingSlots, currentSlot.type)) {
            //     return;
            // }

            let teacherUsedSlots = 0

            if (field === "subject" && value) {

                teacherUsedSlots = updatedSlots.filter(
                    slot => slot.subject === value && slot.type === currentSlot.type
                ).length;

            }

            const maxAllowedSlots = binding.max * (currentSlot.type === "practical" ? 2 : 1);

            if (teacherUsedSlots > maxAllowedSlots) {
                toast.error('Subject exceeds daily slot limit');
                return;
            }
        }

        // Update state
        setWeeklyTimeSlots({
            ...weeklyTimeSlots,
            [day]: updatedSlots
        });
    };

    // Fetch bindings and day data on component mount and day change
    useEffect(() => {
        fetchBindings();
        fetchDayData();
    }, [day, classId]);

    // Save daily timetable
    const handleSaveDay = async () => {
        try {
            const response = await create.saveDayTimetable(classId, {
                day,
                slots: weeklyTimeSlots[day]
            });

            if (response.success) {
                toast.success("Daily timetable saved successfully");
                if (!savedDays.includes(day)) {
                    setSavedDays((prev) => [...prev, day])
                }

            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error('Error saving daily timetable');
        }
    };

    // Get filtered subjects based on type
    const getFilteredSubjects = (slotIndex) => {
        return subjectTeacherBindings.filter(binding =>
            binding.total > 0 &&
            binding.type === weeklyTimeSlots[day][slotIndex].type
        );
    };

    // Get filtered teachers for a specific subject
    const getFilteredTeachers = (slotIndex, subjectId, type) => {
        return subjectTeacherBindings
            .filter(binding =>
                binding.subject._id === subjectId && binding.type === type
            )
            .map(binding => binding.teacher);
    };

    return (
        <Card className="w-full mx-auto p-4 md:p-6 lg:px-20 shadow-lg select-none">
            <CardHeader className="bg-gray-100 p-4 pb-6">
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                    Daily Timetable Builder - {day}
                </CardTitle>
            </CardHeader>
            <CardContent className="bg-zinc-50/60">
                {/* Day Selector - Responsive Adjustments */}
                <div className="py-4 md:py-6">
                    <label htmlFor="day-selector" className="block text-base md:text-xl font-medium text-gray-700 mb-2 md:mb-4">
                        Select Day
                    </label>
                    <Select
                        id="day-selector"
                        value={day}
                        onValueChange={(value) => {
                            navigate(`/admin/timetables/${classId}/${value.toLowerCase()}`);
                            setDay(value);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Day" />
                        </SelectTrigger>
                        <SelectContent>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                                .map(dayOption => (
                                    <SelectItem key={dayOption} value={dayOption}>
                                        {dayOption}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Time Slots Grid - Responsive Layout */}
                <div className="space-y-2 md:space-y-4">
                    {weeklyTimeSlots[day].map((slot, index) => (
                        <div
                            key={index}
                            className={`w-full grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 p-2 md:p-3 rounded-lg ${slot.isBreak ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                            {/* Time Slot Display - Responsive */}
                            <div className="md:col-span-1 flex items-center justify-between md:justify-start">
                                <span className="font-medium text-sm md:text-base text-gray-700">
                                    {slot.time}
                                </span>
                            </div>

                            {/* Break Indicator */}
                            {slot.isBreak ? (
                                <div className="md:col-span-5 text-gray-500 italic text-sm md:text-base">
                                    {slot.breakType}
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-3 md:col-span-5 w-full gap-2 md:gap-4'>
                                    {/* Type Selector - Responsive */}
                                    <Select
                                        disabled={index >= 1 && weeklyTimeSlots[day][index - 1].type === "practical" && slot.type === "practical"}
                                        value={slot.type}
                                        onValueChange={(value) => handleSlotUpdate(
                                            index,
                                            'type',
                                            value
                                        )}
                                    >
                                        <SelectTrigger className="w-full">
                                            <div className="flex items-center text-sm md:text-base">
                                                {slot.type === 'practical' ? <PracticalIcon /> : <LectureIcon />}
                                                <span className="ml-2">
                                                    {slot.type ?
                                                        (slot.type.charAt(0).toUpperCase() + slot.type.slice(1))
                                                        : 'Type'
                                                    }
                                                </span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lecture">
                                                <div className="flex items-center">
                                                    <LectureIcon />
                                                    <span className="ml-2">Lecture</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="practical">
                                                <div className="flex items-center">
                                                    <PracticalIcon />
                                                    <span className="ml-2">Practical</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Subject Selector - Responsive */}
                                    <Select
                                        value={typeof slot.subject === "object" ? slot?.subject?._id : slot.subject}
                                        onValueChange={(value) => handleSlotUpdate(
                                            index,
                                            'subject',
                                            value
                                        )}
                                        disabled={!slot.type || (index >= 1 && weeklyTimeSlots[day][index - 1].type === "practical" && slot.type === "practical")}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Subject" className="text-sm md:text-base" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getFilteredSubjects(index).map(binding => (
                                                <SelectItem
                                                    key={binding.subject?._id}
                                                    value={binding.subject?._id}
                                                >
                                                    {binding.subject?.name} ({binding.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Teacher Selector - Responsive */}
                                    <Select
                                        value={typeof slot.teacher === "object" ? slot.teacher._id : slot.teacher}
                                        onValueChange={(value) => handleSlotUpdate(
                                            index,
                                            'teacher',
                                            value
                                        )}
                                        disabled={!slot.subject || (index >= 1 && weeklyTimeSlots[day][index - 1].type === "practical" && slot.type === "practical")}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Teacher" className="text-sm md:text-base" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getFilteredTeachers(index, typeof slot?.subject === "object" ? slot?.subject?._id : slot.subject, slot.type).map(teacher => (
                                                <SelectItem
                                                    key={teacher._id}
                                                    value={teacher._id}
                                                >
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action Buttons - Responsive */}
                <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                        onClick={handleSaveDay}
                        className="w-full sm:w-auto flex-grow bg-green-600 text-white p-2 md:p-3 rounded"
                    >
                        Save Daily Timetable
                    </button>
                    {areAllDaysSaved() && (
                        <Link
                            to={`/timetables/overview/${classId}`}
                            className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 text-sm p-2 md:p-3 rounded transition duration-300 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            View Timetable
                            <ForwardIcon className='size-4 md:size-5' />
                        </Link>
                    )}
                    <Link
                        to={`/admin/timetables/${classId}`}
                        className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 text-sm p-2 md:p-3 rounded transition duration-300 bg-zinc-200 text-black hover:bg-zinc-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 md:size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                        Update bindings
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyTimetable;