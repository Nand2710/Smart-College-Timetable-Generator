import React, { useState, useEffect } from 'react';
import {
    ArrowRight,
    Clock,
    Users,
    Calendar,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom'

const AboutPage = () => {
    const [stats, setStats] = useState({
        timeSaved: 0,
        institutionsServed: 0,
        efficiencyGain: 0
    });

    useEffect(() => {
        const animateCounters = () => {
            const animationDuration = 2000;
            const intervals = [
                { key: 'timeSaved', target: 70, unit: '%' },
                { key: 'institutionsServed', target: 50, unit: '+' },
                { key: 'efficiencyGain', target: 85, unit: '%' }
            ];

            intervals.forEach(({ key, target, unit }) => {
                let start = 0;
                const step = target / (animationDuration / 16);
                const counter = setInterval(() => {
                    start += step;
                    if (start >= target) {
                        clearInterval(counter);
                        setStats(prev => ({ ...prev, [key]: target }));
                    } else {
                        setStats(prev => ({ ...prev, [key]: Math.round(start) }));
                    }
                }, 16);
            });
        };

        animateCounters();
    }, []);

    const developmentTimeline = [
        { year: 1, event: "Project Conception" },
        { year: 2, event: "Initial Prototype Development" },
        { year: 3, event: "Beta Testing & Refinement" },
        { year: 4, event: "Full Product Launch" }
    ];

    return (
        <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-white text-black min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center text-center px-4 py-16">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] mx-auto to-orange-700">
                        Revolutionizing Scheduling, One Timetable at a Time
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-black max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto">
                        Transform scheduling chaos into an effortless, intelligent process that empowers educational institutions.
                    </p>
                    <Link
                        to={"/login"}
                        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-black text-white to-blue-600 font-bold rounded-full hover:scale-105 transition-transform shadow-md"
                    >
                        Get Started <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                </div>
            </section>

            {/* Impact Statistics */}
            <section className="text-black py-12 sm:py-16">
                <div className="container mx-auto text-center px-4">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl w-full sm:w-[90%] md:w-[80%] lg:w-[80%] mx-auto font-bold mb-8 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 leading-snug">
                        Transforming Educational Efficiency
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { key: 'timeSaved', label: 'Time Saved', icon: <Zap className="mx-auto h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-yellow-400" /> },
                            { key: 'institutionsServed', label: 'Institutions', icon: <Users className="mx-auto h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-blue-400" /> },
                            { key: 'efficiencyGain', label: 'Efficiency Gain', icon: <Clock className="mx-auto h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 text-green-400" /> }
                        ].map(({ key, label, icon }) => (
                            <div key={key} className="bg-gray-200/60 p-4 sm:p-6 rounded-xl">
                                {icon}
                                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 sm:mt-4">
                                    {stats[key]}{key !== 'institutionsServed' ? '%' : '+'}
                                </div>
                                <div className="text-base sm:text-xl text-gray-400 mt-1 sm:mt-2">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Development Timeline */}
            <section className="container mx-auto px-4 py-12 sm:py-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-snug font-bold text-center mb-8 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-red-700">
                    Our Journey
                </h2>
                <div className="space-y-4 sm:space-y-6">
                    {developmentTimeline.map((item, index) => (
                        <div
                            key={index}
                            className="py-3 sm:py-4 px-6 sm:px-10 border border-zinc-200/40 group flex items-center bg-white cursor-pointer"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-600 rounded-full group-hover:scale-110 transition-all flex items-center justify-center mr-4 sm:mr-6">
                                <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">{item.year}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{item.event}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 sm:py-20 md:py-28">
                <div className="container mx-auto text-center px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-transparent leading-snug bg-clip-text bg-gradient-to-r from-black to-indigo-700">
                        Ready to Transform Your Scheduling?
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto">
                        Experience the power of intelligent, automated timetable generation. Simplify your institutional scheduling today.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-xl bg-gradient-to-r from-black to-blue-600 text-white font-bold rounded-full hover:scale-110 transition-transform"
                    >
                        Get Started Today <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;