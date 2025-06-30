import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authAPI, create, subjectAPI } from '../../utils/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    DeleteIcon,
    Trash2Icon,
    SparklesIcon,
    ForwardIcon,
    SparkleIcon
} from 'lucide-react';
import TimetableGenerator from '../../utils/schedule';
import { dailyTimeSlots, weekDays } from '../../constants/index'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import TimetablePreview from './TimetablePreview';
import Confetti from 'react-confetti'


const WeeklySetup = () => {
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [bindings, setBindings] = useState([]);
    const [currentBinding, setCurrentBinding] = useState({
        subject: '',
        teacher: '',
        type: '',
        total: '',
        max: ''
    });
    const [totalAllocatedHours, setTotalAllocatedHours] = useState(0);
    const [isBindingSaved, setIsBindingSaved] = useState(false);
    const [isAutoScheduling, setIsAutoScheduling] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [version, setVersion] = useState(1)
    const [savedDays, setSavedDays] = useState([])

    const navigate = useNavigate();

    const { classId } = useParams();

    const handleAddBinding = () => {
        // Validate all fields are filled
        if (!currentBinding.subject || !currentBinding.teacher ||
            !currentBinding.type || !currentBinding.total ||
            !currentBinding.max) {
            toast.error('Please fill all binding details');
            return;
        }

        // Check if subject already has both lecture and practical bindings
        const existingSubjectBindings = bindings.filter(
            binding => binding.subject === currentBinding.subject
        );

        const hasLectureBinding = existingSubjectBindings.some(
            binding => binding.type === 'lecture'
        );
        const hasPracticalBinding = existingSubjectBindings.some(
            binding => binding.type === 'practical'
        );

        // Prevent adding duplicate binding type for the same subject
        if ((currentBinding.type === 'lecture' && hasLectureBinding) ||
            (currentBinding.type === 'practical' && hasPracticalBinding)) {
            toast.error(`This subject already has a ${currentBinding.type} binding`);
            return;
        }

        // Calculate new total hours
        const newBindings = [...bindings, currentBinding];
        const newTotalHours = newBindings.reduce((total, binding) => {
            return total + (binding.type === 'practical'
                ? binding.total * 2
                : binding.total);
        }, 0);

        // Validate total hours
        if (newTotalHours > 42) {
            toast.error('Total allocated hours cannot exceed 42');
            return;
        }

        // Update state
        setBindings(newBindings);
        setTotalAllocatedHours(newTotalHours);

        // Reset current binding
        setCurrentBinding({
            subject: '',
            teacher: '',
            type: '',
            total: '',
            max: ''
        });
    };

    const handleRemoveBinding = (indexToRemove) => {
        const removedBinding = bindings[indexToRemove];
        const newBindings = bindings.filter((_, index) => index !== indexToRemove);

        // Recalculate total hours
        const newTotalHours = newBindings.reduce((total, binding) => {
            return total + (binding.type === 'practical'
                ? binding.total * 2
                : binding.total);
        }, 0);

        setBindings(newBindings);
        setTotalAllocatedHours(newTotalHours);

        toast.success('Binding removed successfully');
    };

    const handleSubmit = async () => {
        console.log(totalAllocatedHours);

        if (totalAllocatedHours !== 42) {
            toast.error('Total allocated hours must be exactly 42');
            return;
        }

        try {
            const data = await create.weeklySetup(classId, {
                bindings: bindings
            });

            if (data.success) {
                toast.success("Weekly setup saved.");
                setIsBindingSaved(true)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error saving weekly setup');
            console.error('Error saving weekly setup', error);
        }
    };

    const fetchRegisterData = async () => {
        try {
            const subjectData = await subjectAPI.getAll();
            const teachersData = await authAPI.getAllTeachers();

            if (subjectData.success) {
                setSubjects(subjectData.subjects);
                setTotalAllocatedHours(42)
            }

            if (teachersData.success) {
                setTeachers(teachersData.teachers);
            }
        } catch (error) {

            toast.error('Error fetching data');
            console.log(error);
        }
    };

    const fetchBindingHistory = async () => {
        try {
            const bindingData = await create.getBindings(classId);
            if (bindingData.success) {
                setBindings(bindingData.bindings);
                setSavedDays(bindingData.savedDays)
                setIsBindingSaved(true)
            }
        } catch (error) {
            toast.error('Error fetching data');
            console.log(error);
        }
    };

    const handleSaveDay = async (day, dayTimeTable) => {
        try {
            const response = await create.saveDayTimetable(classId, {
                day,
                slots: dayTimeTable
            });

            if (!response.success) {
                toast.error(response.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Error saving daily timetable');
        }
    };


    const autoScheduleTimetables = async () => {
        setIsAutoScheduling(true)
        try {
            const bindingData = await create.getBindings(classId, true);
            if (bindingData.success) {
                const generator = new TimetableGenerator(bindingData.bindings, dailyTimeSlots, weekDays);
                const weeklyTimetable = generator.generateWeeklyTimetable();

                Object.keys(weeklyTimetable).map(async (day) => {
                    await handleSaveDay(day, weeklyTimetable[day])
                })
                setVersion((prev) => prev + 1)
                setShowConfetti(true)
                setTimeout(() => {
                    setShowConfetti(false)
                }, 7000)
                toast.success("Scheduled and saved successfully.")
                // navigate(`/timetables/overview/${classId}`)
            }

        } catch (error) {
            toast.error('Error Loading data');
            console.log(error);
        }
        setIsAutoScheduling(false)
    };

    useEffect(() => {
        fetchRegisterData();
        fetchBindingHistory();
    }, []);

    // Filter out subjects that already have both lecture and practical bindings
    const availableSubjects = subjects.filter(subject => {
        const subjectBindings = bindings.filter(b => b.subject === subject._id);
        return !(subjectBindings.some(b => b.type === 'lecture') &&
            subjectBindings.some(b => b.type === 'practical'));
    });



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


    return (
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 py-6 md:py-10 min-h-screen bg-zinc-50">
            <h2 className="text-2xl sm:text-3xl md:text-4xl pb-6 md:pb-10 pt-4 md:pt-6 font-bold text-center">
                Weekly Setup Form
            </h2>

            {/* Binding Form */}
            <div className="space-y-4 md:space-y-8 mb-6 p-4 sm:p-6 md:p-10 rounded-lg bg-gray-100 border-2 border-zinc-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Subject Dropdown */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Subject</label>
                        <select
                            value={currentBinding.subject}
                            onChange={(e) => setCurrentBinding(prev => ({
                                ...prev,
                                subject: e.target.value
                            }))}
                            className="w-full px-3 py-2 text-sm md:text-base border rounded bg-white"
                        >
                            <option value="">Select Subject</option>
                            {availableSubjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teacher Dropdown */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Teacher</label>
                        <select
                            value={currentBinding.teacher}
                            onChange={(e) => setCurrentBinding(prev => ({
                                ...prev,
                                teacher: e.target.value
                            }))}
                            className="w-full px-3 py-2 text-sm md:text-base border rounded bg-white"
                            disabled={!currentBinding.subject}
                        >
                            <option value="">Select Teacher</option>
                            {teachers
                                .filter(teacher =>
                                    teacher.subjects.some(sub => sub._id === currentBinding.subject)
                                )
                                .map(teacher => (
                                    <option key={teacher._id} value={teacher._id}>
                                        {teacher.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Binding Type Dropdown */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Binding Type</label>
                        <select
                            value={currentBinding.type}
                            onChange={(e) => setCurrentBinding(prev => ({
                                ...prev,
                                type: e.target.value
                            }))}
                            className="w-full px-3 py-2 text-sm md:text-base border rounded bg-white"
                        >
                            <option value="">Select Type</option>
                            <option value="lecture">Lecture</option>
                            <option value="practical">Practical</option>
                        </select>
                    </div>
                </div>

                {/* Total and Max Daily Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">
                            Total Weekly {currentBinding.type ? currentBinding.type + "s" : "Slots"}
                        </label>
                        <input
                            type="number"
                            placeholder="Enter Total Weekly Slots"
                            value={currentBinding.total}
                            onChange={(e) => setCurrentBinding(prev => ({
                                ...prev,
                                total: Number(e.target.value)
                            }))}
                            className="w-full px-3 py-2 text-sm md:text-base border rounded bg-white"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">Max Daily Slots</label>
                        <input
                            type="number"
                            placeholder="Enter Max Daily Slots"
                            value={currentBinding.max}
                            onChange={(e) => setCurrentBinding(prev => ({
                                ...prev,
                                max: Number(e.target.value)
                            }))}
                            className="w-full px-3 py-2 text-sm md:text-base border rounded bg-white"
                            min="1"
                        />
                    </div>
                </div>

                {/* Add Binding Button */}
                <button
                    onClick={handleAddBinding}
                    className="w-full mt-4 px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                >
                    Add Subject-Teacher Binding
                </button>
            </div>

            {/* Existing Bindings Section */}
            <div className="mb-6 mt-10 md:mt-20">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">Current Bindings</h3>
                {bindings.length === 0 ? (
                    <div className="text-center text-gray-500 h-40 md:h-80 flex items-center justify-center rounded-md bg-zinc-100 border-2 border-zinc-300">
                        No bindings added yet
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {bindings.map((binding, index) => {
                            const subject = subjects.find(s => (s._id === binding?.subject || s._id === binding?.subject?._id));
                            const teacher = teachers.find(t => (t._id === binding?.teacher || t._id === binding?.teacher?._id));

                            return (
                                <div
                                    key={index}
                                    className="border-2 border-zinc-300 rounded-lg p-4 sm:p-6 md:p-8 bg-zinc-100 relative"
                                >
                                    <button
                                        onClick={() => handleRemoveBinding(index)}
                                        className="absolute top-2 sm:top-4 right-2 text-red-500 hover:text-red-700"
                                        title="Remove Binding"
                                    >
                                        <Trash2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <div>
                                        <div className='text-base sm:text-lg md:text-xl mb-4'>
                                            {subject ? subject.name : 'Unknown'}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm md:text-base text-center">
                                            <div className='py-2 sm:py-3 bg-white rounded-sm'>
                                                <span className="font-medium">Teacher:</span>{' '}
                                                {teacher ? teacher.name : 'Unknown'}
                                            </div>
                                            <div className='py-2 sm:py-3 bg-white rounded-sm'>
                                                <span className="font-medium">Type:</span>{' '}
                                                {binding.type.charAt(0).toUpperCase() + binding.type.slice(1)}
                                            </div>
                                            <div className='py-2 sm:py-3 bg-white rounded-sm'>
                                                <span className="font-medium">Target {binding.type}s:</span>{' '}
                                                {binding.total}
                                            </div>
                                            <div className='py-2 sm:py-3 bg-white rounded-sm'>
                                                <span className="font-medium">Daily Limit:</span>{' '}
                                                {binding.max}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className='h-0.5 bg-black/50 mb-6 md:mb-10' />

            {/* Total Hours Summary and Submit */}
            <div className="text-center flex flex-col space-y-2 bg-zinc-100 py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-6 rounded-md border-2 border-zinc-300">
                <div className="text-sm sm:text-base md:text-lg font-semibold">
                    <p>Total Allocated Hours: {totalAllocatedHours}/42 </p>
                    <p>Remaining Hours: {42 - totalAllocatedHours} </p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={totalAllocatedHours !== 42}
                    className={`w-full p-2 sm:p-3 rounded transition duration-300 text-sm sm:text-base ${totalAllocatedHours === 42
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Save Weekly Setup
                </button>

                {(totalAllocatedHours === 42 && isBindingSaved) ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Link
                            to={`/admin/timetables/${classId}/monday`}
                            className="flex-1 flex items-center justify-center gap-2 text-base sm:text-xl p-3 sm:p-6 rounded transition duration-300 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Schedule manually
                            <ForwardIcon className='w-4 h-4 sm:w-5 sm:h-5' />
                        </Link>
                        <button
                            className="flex-1 flex items-center justify-center gap-2 text-base sm:text-xl p-3 sm:p-6 rounded transition-all bg-gradient-to-l from-indigo-900 to-indigo-700 text-white"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Auto Schedule
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <span
                        className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm p-2 sm:p-3 rounded bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                        Start Scheduling
                        <ForwardIcon className='w-4 h-4 sm:w-5 sm:h-5' />
                    </span>
                )}

                {areAllDaysSaved() && <Link
                    to={`/timetables/overview/${classId}`}
                    className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm p-2 sm:p-3 rounded transition duration-300 bg-zinc-300 text-black"
                >
                    View Timetable
                    <ForwardIcon className='w-4 h-4 sm:w-5 sm:h-5' />
                </Link>}
            </div>

            {/* Auto Schedule Dialog */}
            {/* Auto Schedule Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-[90%] max-h-[80vh] overflow-y-auto p-4 sm:p-8 select-none">
                    <DialogHeader>
                        {Array.from({ length: showConfetti }).map((_, index) => (
                            <motion.div animate={{
                                opacity: 0,
                                transition: {
                                    delay: 5,
                                    duration: 2
                                }
                            }}>
                                <Confetti />
                            </motion.div>
                        ))}

                        <DialogTitle className="!text-2xl py-2 text-center">Auto Schedule Timetable</DialogTitle>
                        <DialogDescription className="text-[16px] text-center">
                            Click "Start Auto-Scheduling" to generate a timetable automatically based on your subject-teacher bindings.
                        </DialogDescription>

                        <ul className='text-base'>
                            <li>🔸Ensure each subject's total slots match weekly requirements.</li>
                            <li>🔸Ensure total lecture in week are greater than 7.</li>
                            <li>🔸Specify correct type (lecture or practical) for each subject.</li>
                            <li>🔸Set daily slot limits to prevent over-scheduling.</li>
                        </ul>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={autoScheduleTimetables}
                            disabled={isAutoScheduling}
                            className="flex-1 bg-indigo-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 text-base"
                        >
                            {isAutoScheduling ? 'Scheduling...' : 'Start Auto-Scheduling'}
                            {isAutoScheduling ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1,
                                        ease: "linear"
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                    </svg>
                                </motion.div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                navigate(`/admin/timetables/${classId}/monday`)
                            }}
                            className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg text-base flex items-center justify-center gap-2"
                        >
                            Schedule Manually.
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                            </svg>
                        </motion.button>
                    </div>
                    <TimetablePreview classId={classId} version={version} />
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default WeeklySetup;