import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import { AuthContext } from "../../App"

function Footer() {
    const { user } = useContext(AuthContext)
    const location = useLocation();

    const renderNavLink = (to, label) => {
        const isActive = location.pathname === to;
        return (
            <Link
                key={to}
                to={to}
                className={`text-zinc-200 text-sm ${isActive ? 'text-indigo-300' : ''}`}
            >
                {label}
            </Link>
        );
    };

    const adminLinks = [
        { to: '/', label: 'Home' },
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/subjects', label: 'Subjects' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/classes', label: 'Classes' },
    ];

    const studentLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/student', label: 'Dashboard' },
        { to: '/student/timetable', label: 'Timetable' },
    ];

    const teacherLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/teacher', label: 'Dashboard' },
        { to: '/teacher/timetable', label: 'Timetable' },
    ];

    const unAuthorizedUserLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
    ];

    return (
        <footer className="bg-gray-900 text-white py-12 px-6 lg:px-20 pb-20">
            <div className="container mx-auto grid md:grid-cols-3 gap-8">
                <div className="text-center md:text-left mb-6 md:mb-0">
                    <h3 className="text-2xl font-bold mb-4">Schedly</h3>
                    <p className="text-gray-400 text-sm md:text-base">
                        Revolutionizing scheduling for educators and institutions.
                    </p>
                </div>
                <div className="text-center md:text-left mb-6 md:mb-0">
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <nav className="flex flex-col gap-1 items-center md:items-start">
                        {user?.role === "admin"
                            ? adminLinks.map(({ to, label }) => renderNavLink(to, label)) : user?.role === "student"
                                ? studentLinks.map(({ to, label }) => renderNavLink(to, label)) : user?.role === "teacher"
                                    ? teacherLinks.map(({ to, label }) => renderNavLink(to, label))
                                    : unAuthorizedUserLinks.map(({ to, label }) => renderNavLink(to, label))}
                    </nav>
                </div>
                <div className="text-center md:text-left">
                    <h4 className="font-semibold mb-4">Connect</h4>
                    <div className="flex justify-center md:justify-start space-x-4">
                        {/* Placeholder for social media links */}
                        {/* Add social media icons here */}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer