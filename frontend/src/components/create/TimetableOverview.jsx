import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import { create } from "../../utils/api";
import { toast } from "sonner";
import mergePracticalSlots from "../../utils/mergeSlots";
import html2canvas from 'html2canvas';
import { AuthContext } from "../../App";
import { WrenchIcon } from "lucide-react";

const TimetableOverview = () => {
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [classData, setClassData] = useState({});
    const { user } = useContext(AuthContext)
    const { classId } = useParams();
    const [error, setError] = useState("")

    // Define the correct order of days
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
                    // If the data is an object with day keys
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
                
                setClassData(response?.data?.classData);
                setIsLoading(false);
                return;
            }
            else {
                setError("Timetable Havent't been scheduled yet.")
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
            toast.error('Something went wrong.');
        }
    };

    useEffect(() => {
        fetchTimeTable();
    }, [classId]);

    const downloadPDF = () => {
        const element = document.getElementById('timetable-overview'); // Replace with your timetable's container ID
        html2canvas(element, { scale: 3 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg'); // Lower image quality
            const pdf = new jsPDF('landscape', 'mm', 'a4'); // Landscape orientation
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth; // Scale the image to fit the PDF width
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width; // Maintain aspect ratio
            // Center the content vertically and horizontally
            const xOffset = (pdfWidth - imgWidth) / 2; // Horizontal center
            const yOffset = (pdfHeight - imgHeight) / 2; // Vertical center
            pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, '', 'FAST');
            pdf.save(`${classData.name}_timetable.pdf`);
        });
    }

    return (
        <div className="px-4 sm:px-8 md:px-16 lg:px-20 sm:py-4 md:py-10 md:min-h-screen">
            <div className="flex items-center justify-between pt-6 sm:pt-8 md:pt-10 pb-2 border-b-2 border-zinc-300 md:mb-10">
                <h1 className="text-base sm:text-xl md:text-2xl">Weekly Timetable for {classData?.name ? classData?.name : "your class"}</h1>
                {user.role === "admin" && <Link to={`/admin/timetables/${classId}`}> <WrenchIcon className="size-4 md:size-6 hover:text-green-600 cursor-pointer" /></Link>}
            </div>
            <div id="timetable-overview" className="timetableOverview p-4 md:p-10 flex items-center justify-center md:border-2 border-zinc-100 mb-2 bg-transparent md:bg-zinc-50/30 h-[320px] sm:min-h-screen" >
                {!weeklySchedule && !error && <span className="h-6 w-6 rounded-full border-4 border-b-transparent border-blue-600 animate-spin" />}
                {error && error}
                {weeklySchedule && <table className="scale-[0.35] sm:scale-100" border="download-pdf" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th>Day</th>
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
            <button className="text-black bg-blue-100 w-full my-2 text-sm sm:text-lg px-20 py-2 md:py-4" onClick={downloadPDF} style={{ marginBottom: "20px" }}>
                Download PDF
            </button>
        </div>
    );
};

export default TimetableOverview;