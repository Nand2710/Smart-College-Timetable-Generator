import React, { useState, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Mail,
    Lock,
    EyeIcon,
    EyeOffIcon,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { authAPI } from '../../utils/api';
import { AuthContext } from '../../App';

const LoginPage = () => {
    // State management with more descriptive initial state
    const [loginState, setLoginState] = useState({
        email: '',
        password: '',
        showPassword: false,
        error: '',
        isLoading: false
    });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Memoized email validation function
    const isValidEmail = useCallback((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }, []);

    // Centralized state update handler
    const handleInputChange = useCallback((field) => (e) => {
        setLoginState(prev => ({
            ...prev,
            [field]: e.target.value,
            error: '' // Clear error when user starts typing
        }));
    }, []);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setLoginState(prev => ({
            ...prev,
            showPassword: !prev.showPassword
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = loginState;

        // Reset error state
        setLoginState(prev => ({ ...prev, error: '', isLoading: true }));

        // Validation checks
        if (!email) {
            setLoginState(prev => ({
                ...prev,
                error: 'Email is required',
                isLoading: false
            }));
            return;
        }

        if (!isValidEmail(email)) {
            setLoginState(prev => ({
                ...prev,
                error: 'Invalid email format',
                isLoading: false
            }));
            return;
        }

        if (!password) {
            setLoginState(prev => ({
                ...prev,
                error: 'Password is required',
                isLoading: false
            }));
            return;
        }

        if (password.length < 6) {
            setLoginState(prev => ({
                ...prev,
                error: 'Password must be at least 6 characters',
                isLoading: false
            }));
            return;
        }

        try {
            const data = await authAPI.login({ email, password });

            if (data.success) {
                login(data);
                toast.success('Login successful!');
                navigate('/');
            } else {
                // Use toast for more interactive error messaging
                toast.error(data.message || 'Login failed');

                // Update state with error
                setLoginState(prev => ({
                    ...prev,
                    error: data.message || 'Login failed',
                    isLoading: false
                }));
            }
        } catch (err) {
            // Comprehensive error logging
            console.error('Login Error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            const errorMessage = err?.response?.data?.message || 'Login failed. Please try again.';

            // Update state and show toast
            setLoginState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));

            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-black flex items-center justify-center px-4">
            <div className="w-full md:w-[500px] lg:w-[40%] bg-white shadow-sm border-2 border-zinc-300 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-zinc-100 p-4 md:p-6 text-center text-black border-b-2 border-zinc-300">
                    <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Welcome Back</h2>
                    <p className="text-xs md:text-base text-zinc-700">Sign in to continue</p>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-8">
                    {/* Email Input */}
                    <div className="relative">
                        <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                            Email Address
                        </label>
                        <div className="flex items-center">
                            <Mail className="absolute left-3 text-gray-400" size={16} md:size={20} />
                            <input
                                type="email"
                                id="email"
                                value={loginState.email}
                                onChange={handleInputChange('email')}
                                placeholder="Enter your email"
                                className="w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2 text-xs md:text-base border rounded-lg focus:outline-none 
                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label htmlFor="password" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                            Password
                        </label>
                        <div className="flex items-center">
                            <Lock className="absolute left-3 text-gray-400" size={16} md:size={20} />
                            <input
                                type={loginState.showPassword ? "text" : "password"}
                                id="password"
                                value={loginState.password}
                                onChange={handleInputChange('password')}
                                placeholder="Enter your password"
                                className="w-full pl-8 md:pl-10 pr-10 py-1.5 md:py-2 text-xs md:text-base border rounded-lg focus:outline-none 
                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 text-gray-400 hover:text-blue-500 focus:outline-none"
                                aria-label={loginState.showPassword ? "Hide password" : "Show password"}
                            >
                                {loginState.showPassword ? <EyeOffIcon size={16} md:size={20} /> : <EyeIcon size={16} md:size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {loginState.error && (
                        <div
                            className="bg-red-50 border border-red-300 text-red-700 
                                px-2 md:px-4 py-1 md:py-2 rounded-lg flex items-center 
                                animate-shake text-xs md:text-sm"
                        >
                            <AlertCircle className="mr-2 text-red-500" size={16} md:size={20} />
                            {loginState.error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loginState.isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 
                            text-white py-2 md:py-3 rounded-lg hover:from-blue-600 
                            hover:to-blue-700 focus:outline-none focus:ring-2 
                            focus:ring-blue-300 transition-all duration-300 
                            flex items-center justify-center text-xs md:text-base"
                    >
                        {loginState.isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span className="md:ml-1 text-white">Logging in...</span>
                            </>
                        ) : (
                            <>
                                Login
                                <ChevronRight className="ml-1 md:ml-2" size={16} md:size={20} />
                            </>
                        )}
                    </button>

                    {/* Register Link */}
                    <div className="text-center mt-2 md:mt-4">
                        <p className="text-xs md:text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-blue-500 hover:text-blue-600 
                                font-medium transition-colors duration-300 text-xs md:text-sm"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;