import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar,
    TrendingUp,
    PlusCircle,
    ChevronRight,
    Rocket
} from 'lucide-react';
import { AuthContext } from '../App';

const HomePage = () => {
    const { isAuthenticated, user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
            {/* Hero Section */}
            <section className="relative py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-200 opacity-50 -z-10"></div>

                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="space-y-4 sm:space-y-6 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl leading-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-indigo-600">
                            Supercharge Your Scheduling with Schedly!
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-gray-700">
                            Say goodbye to manual scheduling. Automate and optimize your timetables effortlessly with precision and ease.
                        </p>

                        {!isAuthenticated ? (
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Get Started!
                                    <Rocket className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>

                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                >
                                    Log In
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>
                            </div>
                        ) : user.role === "admin" ? (
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                {/* <Link
                                    to="/admin"
                                    className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Admin Dashboard
                                    <Rocket className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link> */}

                                <Link
                                    to="/admin/classes"
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                >
                                    Create Timetable
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>
                            </div>
                        ) : user.role === "teacher" ? (
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link
                                    to="/teacher"
                                    className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all transform hover:scale-105 shadow-lg"
                                >
                                    View Timetables
                                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>

                                <Link
                                    to="/teacher"
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                >
                                    View Updates
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>
                            </div>
                        ) : user.role === "principal" ? (
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link
                                    to="/principal"
                                    className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Principal Dashboard
                                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                >
                                    Contact Support
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link
                                    to={`/timetables/overview/${user.assignedClass}`}
                                    className="flex items-center justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all transform hover:scale-105 shadow-lg"
                                >
                                    View Timetable
                                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>

                                <Link
                                    to="/about"
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all transform hover:scale-105"
                                >
                                    Know More
                                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="relative cursor-pointer h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden group shadow-2xl rounded-md">
                        <div className="bg-white/60 backdrop-blur-lg p-4 sm:p-6 shadow-2xl absolute w-full h-full">
                            <img
                                src="/week.jpeg"
                                alt="Schedly Dashboard"
                                className="transform transition-transform duration-1000 group-hover:-translate-y-16"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Sections */}
            <div className="px-4 sm:px-6 lg:px-20 py-8 sm:py-12 md:py-16 space-y-8 sm:space-y-12 md:space-y-16">
                {/* Analytics Section */}
                <section className="bg-white rounded-md shadow-lg p-6 sm:p-8 py-16 sm:py-20 md:py-28">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-purple-700">
                            Simplify Management, Amplify Efficiency
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                            Seamlessly manage your classes, subjects, and users—all in one place!
                        </p>
                        {/* <div className="flex justify-center md:justify-start">
                            <Link
                                to="/admin"
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
                            >
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                Admin Dashboard
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                        </div> */}
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 sm:py-10'>
                        <div className="relative border-2 border-zinc-300 sm:col-span-2 cursor-pointer h-[240px] sm:h-[360px] md:h-[440px] overflow-hidden group rounded-md">
                            <div className="bg-white/60 backdrop-blur-lg p-4 sm:p-6 absolute w-full h-full">
                                <img
                                    src="/users.jpeg"
                                    alt="Schedly Dashboard"
                                    className="transform transition-transform duration-1000 group-hover:-translate-y-40"
                                />
                            </div>
                        </div>
                        <div className="relative border-2 border-zinc-300 cursor-pointer h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden group rounded-md">
                            <div className="bg-white/60 backdrop-blur-lg p-4 sm:p-6 absolute w-full h-full">
                                <img
                                    src="/classes.jpeg"
                                    alt="Schedly Dashboard"
                                    className="transform transition-transform duration-1000 group-hover:-translate-y-2"
                                />
                            </div>
                        </div>

                        <div className="relative border-2 border-zinc-300 cursor-pointer h-[200px] sm:h-[280px] md:h-[360px] overflow-hidden group rounded-md">
                            <div className="bg-white/60 backdrop-blur-lg p-4 sm:p-6 absolute w-full h-full">
                                <img
                                    src="/subjects.jpeg"
                                    alt="Schedly Dashboard"
                                    className="transform transition-transform duration-1000 group-hover:-translate-y-2"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Create Timetable Section */}
                <section className="bg-white rounded-md shadow-lg p-6 sm:p-8 py-16 sm:py-20 md:py-28 flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
                    <div className="relative flex-1 cursor-pointer h-[240px] sm:h-[280px] md:h-[360px] overflow-hidden group rounded-md w-full md:w-auto">
                        <div className="bg-white/60 backdrop-blur-lg p-4 sm:p-6 absolute w-full h-full">
                            <img
                                src="/day.jpeg"
                                alt="Schedly Dashboard"
                                className="transform transition-transform duration-1000 group-hover:-translate-y-28"
                            />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-green-700">
                            Design Your Perfect Schedule!
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                            Create error-free timetables effortlessly with our user-friendly interface. Customize, preview, and publish schedules in minutes.
                        </p>

                        <div className="flex justify-center md:justify-start">
                            <Link
                                to="/admin/classes"
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                            >
                                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                Start Building
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* View Timetables Section */}
                <section className="rounded-md bg-white shadow-lg p-6 sm:p-8 py-16 sm:py-20 md:py-28 flex flex-col-reverse md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-blue-700">
                            Simplify Timetable Management!
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                            Access all your timetables at a glance. Make changes on the fly and stay on top of your schedule effortlessly.
                        </p>
                        <div className="flex justify-center md:justify-start">
                            <Link
                                to="/admin/classes"
                                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                            >
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                Browse Timetables
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative flex-1 cursor-pointer h-[240px] sm:h-[280px] md:h-[360px] overflow-hidden group rounded-md w-full md:w-auto">
                        <div className="bg-white/60 backdrop-blur-lg p-4 sm:p-6 absolute w-full h-full">
                            <img
                                src="/week.jpeg"
                                alt="Schedly Dashboard"
                                className="transform transition-transform duration-1000 group-hover:-translate-y-28"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;