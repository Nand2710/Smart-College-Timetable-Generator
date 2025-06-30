import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Users, Book, Bell,
    AlertCircle, FileText, RefreshCw, Menu
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { authAPI } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';

const TeacherDashboard = () => {
    const [activeDay, setActiveDay] = useState('Monday');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dashboardData, setDashboardData] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fetchTeacherDashboard = async () => {
        try {
            const data = await authAPI.getTeacherDashboard();

            if (data.success) {
                setDashboardData(data.dashboardData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Client side error.");
        }
    };

    useEffect(() => {
        fetchTeacherDashboard();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const getDaySchedule = (day) => {
        if (!dashboardData?.schedule[day]) {
            return [];
        }

        return dashboardData.schedule[day]
            .map(slot => ({
                time: slot.time,
                subject: slot.subject.name || "N/A",
                subjectCode: slot.subject.code || "N/A",
                class: slot.class.name || "N/A",
                type: slot.type || "Lecture"
            }))
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    return (
        <div className="container mx-auto p-4 space-y-4 min-h-screen pb-40 py-10 max-w-7xl">
            {/* Mobile Header with Sidebar Toggle */}
            <div className="md:hidden flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold flex items-center">
                    <Calendar className="mr-2" /> Teacher Dashboard
                </h1>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="!bg-white" side="right">
                        <SheetHeader className={"mt-5"}>
                            <SheetTitle>Dashboard Menu</SheetTitle>
                        </SheetHeader>
                        {/* Mobile Menu Content */}
                        <div className="space-y-4 mt-4">
                            <div>
                                <h2 className="font-semibold mb-2">Notifications</h2>
                                {dashboardData?.notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-2 mb-2 rounded ${notification.type === 'alert'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}
                                    >
                                        <AlertCircle className="inline mr-2" size={16} />
                                        {notification.message}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h2 className="font-semibold mb-2">My Subjects</h2>
                                {dashboardData?.subjects.map((subject, index) => (
                                    <div key={index} className="mb-3 p-2 border rounded">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-semibold">{subject.name}</p>
                                                <p className="text-base text-gray-600">Code: {subject.code}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop/Laptop Header */}
            <div className="hidden md:flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center">
                    <Calendar className="mr-2" /> Teacher Dashboard
                </h1>
                <div className="text-right">
                    <p className="font-semibold">{dashboardData?.teacher.name}</p>
                    <p className="text-base text-gray-600">
                        {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Mobile Time Display */}
            <div className="md:hidden text-center mb-4">
                <p className="font-semibold">{dashboardData?.teacher.name}</p>
                <p className="text-base text-gray-600">
                    {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
                </p>
            </div>

            {/* Loading State */}
            {!dashboardData && <div className='flex items-center justify-center h-[80vh]'>
                <div className="h-6 w-6 rounded-full border-4 border-b-transparent border-blue-600 animate-spin" />
            </div>}

            {dashboardData && <>
                {/* Notifications Card - Visible on Desktop, in Mobile Sidebar */}
                <Card className="w-full hidden md:block">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center">
                            <Bell className="mr-2" /> Notifications
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                            <RefreshCw size={16} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {dashboardData.notifications.slice(0, -1).map(notification => (
                            <div
                                key={notification.id}
                                className={`p-2 mb-2 rounded ${notification.type === 'alert'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}
                            >
                                <AlertCircle className="inline mr-2" size={16} />
                                {notification.message}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Daily Schedule Tabs */}
                <Tabs defaultValue="Monday" onValueChange={setActiveDay}>
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-zinc-100 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <TabsTrigger key={day} value={day} className="text-xs md:text-base">
                                {day.substring(0, 3)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <TabsContent key={day} value={day}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base md:text-xl">
                                        <Clock className="mr-2 w-4 h-4 md:w-6 md:h-6" /> {day} Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {getDaySchedule(day).length > 0 ? (
                                        getDaySchedule(day).map((slot, index) => (
                                            <div
                                                key={index}
                                                className={`p-2 md:p-3 mb-2 border rounded-lg bg-white border-gray-200`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold flex items-center text-sm md:text-base">
                                                            <Book className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                                                            {slot.subject} ({slot.subjectCode})
                                                        </p>
                                                        <p className="text-xs md:text-base text-gray-600">
                                                            <Users className="inline mr-1 w-3 h-3 md:w-4 md:h-4" />
                                                            Class: {slot.class}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-xs md:text-base">{slot.time}</p>
                                                        <span className="text-[10px] md:text-xs text-green-600 capitalize">
                                                            {slot.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 h-[300px] md:h-[500px] flex items-center justify-center">
                                            No classes scheduled
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Additional Cards for Subject and Class Management */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Subjects Card - Hidden on Mobile, shown in Sidebar */}
                    <Card className="hidden md:block">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Book className="mr-2" /> My Subjects
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dashboardData.subjects.map((subject, index) => (
                                <div key={index} className="mb-3 p-2 border rounded">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-semibold">{subject.name}</p>
                                            <p className="text-base text-gray-600">Code: {subject.code}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Feedback Card */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-base md:text-xl">
                                <FileText className="mr-2 w-4 h-4 md:w-6 md:h-6" /> Feedback & Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full mb-2 text-xs md:text-base" variant="outline">
                                Report Schedule Issue
                            </Button>
                            <Button className="w-full text-xs md:text-base" variant="outline">
                                Request Schedule Change
                            </Button>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-2 text-center">
                                Having trouble with your schedule? Let us know!
                            </p>
                        </CardContent>
                    </Card> */}
                </div>
            </>}
        </div>
    );
};

export default TeacherDashboard;