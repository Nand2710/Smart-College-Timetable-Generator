import React, { useState, useEffect, useContext } from "react";
import { create } from "../../utils/api";
import { toast } from "sonner";
import mergePracticalSlots from "../../utils/mergeSlots";
import { Link, useNavigate } from "react-router-dom";

const TimetablePreview = ({ classId, version }) => {
    const [weeklySchedule, setWeeklySchedule] = useState(null);

    const dailyTimeSlots = [
        "10:15 AM - 11:15 AM",
        "11:15 AM - 12:15 PM",
        "12:15 PM - 1:15 PM",
        "1:15 TO 1:45 (BREAK)",
        "1:45 PM - 2:45 PM",
        "2:45 PM - 3:45 PM",
        "3:45 TO 4:00 (BREAK)",
        "4:00 PM - 5:00 PM",
        "5:00 PM - 6:00 PM",
    ];

    // Define the correct order of days
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const navigate = useNavigate()
    const navigateToTimetableOverview = () => {
        navigate(`/timetables/overview/${classId}`)
    }

    const fetchTimeTable = async () => {
        try {
            const response = await create.getFullTimetable(classId);

            if (response.success) {
                // Get the original data from the API
                const originalData = response?.data?.weeklySchedule;
                
                if (originalData) {
                    // If the data is already an array, sort it by day order
                    if (Array.isArray(originalData)) {
                        const orderedSchedule = [...originalData].sort((a, b) => {
                            return orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day);
                        });
                        setWeeklySchedule(orderedSchedule);
                    } 
                    // If the data is an object with day keys (as in your example)
                    else {
                        // Convert to ordered array while preserving all original data
                        const orderedSchedule = orderedDays
                            .filter(day => originalData[day]) // Only include days that exist in the data
                            .map(day => ({
                                day: day,
                                slots: originalData[day]
                            }));
                        setWeeklySchedule(orderedSchedule);
                    }
                } else {
                    setWeeklySchedule(null);
                }
                return;
            }
            toast.error(response.message);
        } catch (error) {
            console.error('Error fetching timetable:', error);
            toast.error('Something went wrong.');
        }
    };

    useEffect(() => {
        fetchTimeTable();
    }, [classId, version]);

    return (
        <div className="">
            <h3 className="py-2 font-semibold text-xl">Timetable Preview</h3>

            <div className="w-full bg-zinc-200 border rounded-lg flex lg:hidden justify-center items-center p-10 my-4">
                <p>Preview is not available on smaller screen sizes; use full screen instead.</p>
            </div>
            
            <div className="timetablePreview p-4 hidden lg:flex items-center justify-center border-2 border-zinc-100 mb-2 bg-zinc-50/30">
                {!weeklySchedule && <span className="h-6 w-6 rounded-full border-4 border-b-transparent border-blue-600 animate-spin" />}
                {weeklySchedule && <table className="scale-[0.35] sm:scale-100" border="download-pdf" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr className="h-2">
                            <th className="">Day</th>
                            {dailyTimeSlots.map((slot, index) => (
                                <th key={index}>{slot}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeklySchedule.map((daySchedule, dayIndex) => {
                            return (
                                <tr
                                    key={dayIndex}
                                >
                                    <td>{daySchedule.day}</td>
                                    {dailyTimeSlots.map((timeSlot, slotIndex) => {
                                        const mergedSlots = mergePracticalSlots(daySchedule.slots)
                                        const slot = mergedSlots.find((s) => s.time.includes(timeSlot));

                                        if (timeSlot.includes("BREAK")) {
                                            return <td key={slotIndex}></td>;
                                        }
                                        if (!slot) {
                                            return
                                        }
                                        if (slot && slot.type === "practical") {
                                            return (
                                                <td
                                                    key={slotIndex}
                                                    colSpan="2"
                                                    style={{
                                                        backgroundColor: "#f0f0f0",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {slot.type} <br /> {slot.subject} <br /> ({slot.teacher})
                                                </td>
                                            );
                                        } else if (!daySchedule.slots.some((s) => s.time.includes(timeSlot))) {
                                        }
                                        return (
                                            <td key={slotIndex}>
                                                {slot.type} <br />  {slot?.subject} <br /> ({slot?.teacher})
                                            </td>
                                        );
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>}
            </div>
            <button className="text-black bg-blue-100 w-full text-lg px-10 py-2" onClick={navigateToTimetableOverview}>Full screen</button>
        </div >
    );
};

export default TimetablePreview;