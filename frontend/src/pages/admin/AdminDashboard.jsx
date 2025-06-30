import React, { useState, useEffect, useContext } from 'react';
import {
    UserIcon,
    BookOpenIcon,
    UsersIcon,
    SunIcon,
    LinkIcon,
    MoonIcon,
    PhoneCallIcon,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../App';
import {
    authAPI
} from '../../utils/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        userStats: {
            totalTeachers: 0,
            totalStudents: 0,
            totalAdmins: 0
        },
        systemStats: {
            totalSubjects: 0,
            totalClasses: 0,
            totalTimetables: 0
        },
        charts: {
            userRoleDistribution: [],
            classDistribution: [],
            subjectGrowth: []
        },
        recentActivities: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await authAPI.getAdminData();
                setDashboardData(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };

        fetchDashboardData();
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const quickActions = [
        {
            title: 'Manage Subjects',
            icon: <BookOpenIcon className="size-6 text-purple-500" />,
            link: '/admin/subjects'
        },
        {
            title: 'Manage Users',
            icon: <UsersIcon className="size-6 text-green-500" />,
            link: '/admin/users'
        },
        {
            title: 'Manage Classes',
            icon: <UserIcon className="size-6 text-blue-500" />,
            link: '/admin/classes'
        },
        {
            title: 'View New Contacts',
            icon: <PhoneCallIcon className="size-6 text-blue-500" />,
            link: '/admin/contacts'
        }
    ];

    return (
        <div className={`p-4 sm:p-6 md:px-10 lg:px-20`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center my-3 sm:my-5 space-y-3 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left w-full">
                    Welcome, {user?.name || 'Admin'}
                </h1>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-700 transition hidden sm:block"
                >
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mx-auto">
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white`}>
                    <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-2 sm:mb-4" />
                    <div className="text-center">
                        <p className="text-lg sm:text-2xl font-semibold">Teachers</p>
                        <p className="text-xl sm:text-2xl font-bold">{dashboardData.userStats.totalTeachers}</p>
                    </div>
                </div>
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white`}>
                    <UsersIcon className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 mx-auto mb-2 sm:mb-4" />
                    <div className="text-center">
                        <p className="text-lg sm:text-2xl font-semibold">Students</p>
                        <p className="text-xl sm:text-2xl font-bold">{dashboardData.userStats.totalStudents}</p>
                    </div>
                </div>
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white col-span-1 sm:col-span-2 lg:col-span-1`}>
                    <BookOpenIcon className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500 mx-auto mb-2 sm:mb-4" />
                    <div className="text-center">
                        <p className="text-lg sm:text-2xl font-semibold">Subjects</p>
                        <p className="text-xl sm:text-2xl font-bold">{dashboardData.systemStats.totalSubjects}</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* User Role Distribution Pie Chart */}
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white`}>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">User Roles Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.charts.userRoleDistribution}
                                cx="50%"
                                cy="50%"
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius="80%"
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {dashboardData.charts.userRoleDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Classes Distribution Bar Chart */}
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white`}>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Classes Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.charts.classDistribution}>
                            <XAxis dataKey="name" />
                            <YAxis tickCount={1} />
                            <Tooltip />
                            <Bar dataKey="studentCount" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Growth Line Chart */}
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white col-span-1 md:col-span-2 lg:col-span-1`}>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Subject Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.charts.subjectGrowth}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="subjects" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
                <div className={`p-4 sm:p-6 rounded-md shadow-sm border-2 border-zinc-200 bg-white`}>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 flex items-center">
                        <LinkIcon className="mr-2 size-4 sm:size-5" /> Quick Actions
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className="flex items-center hover:bg-blue-200 px-4 py-4 sm:px-8 sm:py-8 rounded-md transition w-full bg-blue-100 mb-2 sm:mb-0 text-center sm:text-left"
                            >
                                {action.icon}
                                <span className="ml-3 font-medium text-base sm:text-xl">{action.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;