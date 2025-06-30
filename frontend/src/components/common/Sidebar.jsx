import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Calendar,
    BookOpen,
    Users,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { AuthContext } from '../../App';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const navLinks = {
        admin: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
            { path: '/timetables', label: 'Manage Timetables', icon: Calendar },
            { path: '/subjects', label: 'Manage Subjects', icon: BookOpen },
            { path: '/users', label: 'Manage Users', icon: Users }
        ],
        teacher: [
            { path: '/teacher/dashboard', label: 'Dashboard', icon: Home },
            { path: '/teacher/timetable', label: 'View Timetable', icon: Calendar }
        ],
        student: [
            { path: '/student/dashboard', label: 'Dashboard', icon: Home },
            { path: '/student/timetable', label: 'View Timetable', icon: Calendar }
        ]
    };

    const userLinks = navLinks[user?.role] || [];

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`
      h-screen bg-gray-800 text-white transition-all duration-300 
      ${isCollapsed ? 'w-20' : 'w-64'}
      fixed left-0 top-0 z-50
    `}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                {!isCollapsed && (
                    <div className="text-xl font-bold">Timetable App</div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    {isCollapsed ? <ChevronsRight size={24} /> : <ChevronsLeft size={24} />}
                </button>
            </div>

            <nav className="mt-4">
                {userLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`
                flex items-center p-4 hover:bg-gray-700 
                ${isActive(link.path) ? 'bg-blue-600' : ''}
                transition-colors duration-200
              `}
                        >
                            <Icon className="mr-4" size={isCollapsed ? 24 : 20} />
                            {!isCollapsed && <span>{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;