import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const adminLinks = [
        { to: '/', label: 'Home' },
        // { to: '/admin', label: 'Dashboard' },
        { to: '/admin/subjects', label: 'Subjects' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/classes', label: 'Classes' },
        { to: '/admin/contacts', label: 'New Contacts' },
    ];

    const studentLinks = [
        { to: '/', label: 'Home' },
        // { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
        { to: `/timetables/overview/${user && user?.assignedClass}`, label: 'Timetable' },
    ];

    const teacherLinks = [
        { to: '/', label: 'Home' },
        // { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
        { to: '/teacher', label: 'Dashboard' },
    ];

    const principalLinks = [
        { to: '/', label: 'Home' },
        { to: '/principal', label: 'Dashboard' },
        { to: '/contact', label: 'Contact' },
    ];

    const unAuthorizedUserLinks = [
        { to: '/', label: 'Home' },
        // { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
    ];

    const renderNavLink = (to, label) => {
        const isActive = location.pathname === to;
        return (
            <Link
                key={to}
                to={to}
                className={`text-gray-700 hover:text-blue-600 ${isActive ? 'border-b border-black' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {label}
            </Link>
        );
    };

    const renderLinks = () => {
        const links = user?.role === "admin"
            ? adminLinks
            : user?.role === "student"
                ? studentLinks
                : user?.role === "teacher"
                    ? teacherLinks
                    : user?.role === "principal"
                        ? principalLinks
                        : unAuthorizedUserLinks;

        return links.map(({ to, label }) => renderNavLink(to, label));
    };

    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className="bg-white border-b border-zinc-200">
            <div className="mx-auto px-6 py-3 flex justify-between items-center relative">
                {/* Logo Section */}
                <div className="text-xl flex items-center justify-center gap-2 md:w-[250px] w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                    </svg>
                    <Link
                        to="/"
                        className="font-bold text-blue-600 hover:text-blue-800"
                    >
                        Schedly
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-700 focus:outline-none"
                    >
                        {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 items-center gap-3">
                    {renderLinks()}
                </div>

                {/* Authentication and User Actions */}
                <div className="hidden md:flex items-center justify-end space-x-4 w-[250px]">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login">
                                <button
                                    onClick={logout}
                                    className="bg-blue-500"
                                >Login</button>
                            </Link>
                            <Link to="/register">
                                <button
                                    onClick={logout}
                                    className="bg-green-500"
                                >Register</button>
                            </Link>
                        </>
                    ) : (
                        <>
                            {user?.role === 'ADMIN' ? (
                                <Link
                                    to="/admin"
                                    className={`text-gray-700 hover:text-blue-600 ${location.pathname === "/admin" && "border-b-2 border-b-black"}`}
                                >
                                    Admin
                                </Link>
                            ) : (
                                <p
                                    className={`capitalize text-gray-700 hover:text-blue-600 ${location.pathname === "/admin" && "border-b-2 border-b-black"}`}
                                >
                                    {user.name}
                                </p>
                            )}
                            <img src="/user.jpg" alt="user" className="h-10 w-10 rounded-full cursor-pointer" />
                            <button
                                onClick={logout}
                                className="bg-red-500"
                            >Logout</button>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute z-50 top-full left-0 w-full bg-indigo-100/40 backdrop-blur-md md:hidden">
                        <div className="flex flex-col items-center py-4 space-y-3">
                            {renderLinks()}

                            {!isAuthenticated ? (
                                <div className="flex space-x-4">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="bg-blue-500">Login</button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="bg-green-500">Register</button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-3">
                                    {user?.role === 'ADMIN' ? (
                                        <Link
                                            to="/admin"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-gray-700 hover:text-blue-600 ${location.pathname === "/admin" && "border-b-2 border-b-black"}`}
                                        >
                                            Admin
                                        </Link>
                                    ) : (
                                        <p className="capitalize text-gray-700">
                                            {user.name}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="bg-red-500"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;