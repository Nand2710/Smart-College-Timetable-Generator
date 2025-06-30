import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, classAPI, subjectAPI } from '../../utils/api';
import { toast } from 'sonner';
import { AuthContext } from '../../App';
import {
    ChevronRight,
    UserCircle2,
    Mail,
    Lock,
    Search,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        assignedClass: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [validations, setValidations] = useState({
        name: false,
        email: false,
        password: false,
        role: false
    });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch initial data
    useEffect(() => {
        const fetchRegisterData = async () => {
            try {
                const [subjectRes, classesRes] = await Promise.all([
                    subjectAPI.getAll(),
                    classAPI.getAll()
                ]);

                if (subjectRes.success) setSubjects(subjectRes.subjects);
                if (classesRes.success) setClasses(classesRes.classes);
            } catch (error) {
                toast.error('Failed to load registration data');
                console.error(error);
            }
        };
        fetchRegisterData();
    }, []);

    // Validation functions
    const validateName = (name) => name.trim().length > 2;
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;

    // Handle input changes with validation
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Perform validation
        switch (name) {
            case 'name':
                setValidations(prev => ({
                    ...prev,
                    name: validateName(value)
                }));
                break;
            case 'email':
                setValidations(prev => ({
                    ...prev,
                    email: validateEmail(value)
                }));
                break;
            case 'password':
                setValidations(prev => ({
                    ...prev,
                    password: validatePassword(value)
                }));
                break;
            case 'role':
                setValidations(prev => ({
                    ...prev,
                    role: !!value
                }));
                break;
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Comprehensive validation
        const { name, email, password, role, assignedClass } = formData;

        if (!validateName(name)) {
            setError('Please enter a valid name');
            setIsLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        if (!role) {
            setError('Please select a role');
            setIsLoading(false);
            return;
        }

        // Role-specific validations
        if (role === 'student' && !assignedClass) {
            setError('Please select a class');
            setIsLoading(false);
            return;
        }

        if (role === 'teacher' && selectedSubjects.length === 0) {
            setError('Please select at least one subject');
            setIsLoading(false);
            return;
        }

        try {
            const data = await authAPI.register({
                ...formData,
                subjects: selectedSubjects
            });

            if (data.success) {
                login(data);
                toast.success("Registered and logged in successfully!");
                navigate('/');
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong during registration");
        } finally {
            setIsLoading(false);
        }
    };

    // Filter subjects based on search
    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-black flex items-center justify-center p-4">
            <div className="w-full md:w-[80%] lg:w-[60%] bg-white/100 backdrop-blur-lg rounded-md border-2 border-zinc-300 overflow-hidden my-10">
                {/* Header */}
                <div className="p-4 md:p-6 text-center text-black bg-zinc-50 border-b-2 border-b-zinc-300">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-sm md:text-base text-zinc-700">Join our platform and start your journey!</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-8">
                    {/* Name Input */}
                    <div className="relative">
                        <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="flex items-center">
                            <UserCircle2 className="absolute left-3 text-gray-400" size={16} md:size={20} />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={`w-full pl-8 md:pl-10 pr-8 py-2 text-xs md:text-base border rounded-lg focus:outline-none 
                                    ${validations.name
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-200'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                            />
                            {validations.name && <CheckCircle2 className="absolute right-3 text-green-500" size={16} md:size={20} />}
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                        <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="flex items-center">
                            <Mail className="absolute left-3 text-gray-400" size={16} md:size={20} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`w-full pl-8 md:pl-10 pr-8 py-2 text-xs md:text-base border rounded-lg focus:outline-none 
                                    ${validations.email
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-200'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                            />
                            {validations.email && <CheckCircle2 className="absolute right-3 text-green-500" size={16} md:size={20} />}
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="flex items-center">
                            <Lock className="absolute left-3 text-gray-400" size={16} md:size={20} />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                className={`w-full pl-8 md:pl-10 pr-8 py-2 text-xs md:text-base border rounded-lg focus:outline-none 
                                    ${validations.password
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-200'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}`}
                            />
                            {validations.password && <CheckCircle2 className="absolute right-3 text-green-500" size={16} md:size={20} />}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                            Select Your Role
                        </label>
                        <div className="flex space-x-2">
                            {['student', 'teacher', 'admin', 'principal'].map(role => (
                                <button
                                    type="button"
                                    key={role}
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            role: role,
                                            assignedClass: role === 'student' ? '' : prev.assignedClass
                                        }));
                                        setValidations(prev => ({ ...prev, role: true }));
                                    }}
                                    className={`flex-1 py-2 text-xs md:text-base rounded-lg transition-all duration-300
                                        ${formData.role === role
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Fields */}
                    {formData.role === 'student' && (
                        <div>
                            <label htmlFor="assignedClass" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Select Your Class
                            </label>
                            <select
                                id="assignedClass"
                                name="assignedClass"
                                value={formData.assignedClass}
                                onChange={handleChange}
                                className="w-full py-2 text-xs md:text-base bg-white px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0"
                            >
                                <option value="">Choose a class</option>
                                {classes.map((cl) => (
                                    <option key={cl._id} value={cl._id}>
                                        {cl.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.role === 'teacher' && (
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                                Select Subjects You Teach
                            </label>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-3 text-gray-400" size={16} md:size={18} />
                                <input
                                    type="text"
                                    placeholder="Search subjects"
                                    value={subjectSearch}
                                    onChange={(e) => setSubjectSearch(e.target.value)}
                                    className="w-full pl-8 md:pl-10 pr-3 py-2 text-xs md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                                {filteredSubjects.map((subject) => (
                                    <button
                                        type="button"
                                        key={subject._id}
                                        onClick={() => {
                                            const isSelected = selectedSubjects.includes(subject._id);
                                            setSelectedSubjects(prev =>
                                                isSelected
                                                    ? prev.filter(id => id !== subject._id)
                                                    : [...prev, subject._id]
                                            );
                                        }}
                                        className={`py-2 md:py-3 text-xs md:text-base rounded-sm transition-all duration-300 
                                            ${selectedSubjects.includes(subject._id)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                        {subject.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 text-xs md:text-sm rounded-lg flex items-center">
                            <XCircle className="mr-2 text-red-500" size={16} md:size={20} />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                            py-2 md:py-3 text-xs md:text-base rounded-lg hover:from-blue-600 hover:to-blue-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-300 
                            transition-all duration-300 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </>
                        ) : (
                            <>
                                Register
                                <ChevronRight className="ml-2" size={20} />
                            </>
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                        <p className="text-xs sm:text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-blue-500 text-xs sm:text-sm hover:text-blue-600 font-medium 
                                transition-colors duration-300"
                            >
                                Login here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;