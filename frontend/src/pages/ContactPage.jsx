import React, { useState } from 'react';
import { Mail, Phone, User, Send } from 'lucide-react';
import { toast } from 'sonner';
import { contact } from '../utils/api';

const ContactPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        message: ''
    });

    // Validation state
    const [errors, setErrors] = useState({});

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific field error on typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form before submission
    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Mobile number validation
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!phoneRegex.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Invalid mobile number format';
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        } else if (formData.message.trim().length > 500) {
            newErrors.message = 'Message cannot exceed 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            toast.error('Please correct the errors in the form');
            return;
        }

        try {
            // Submit form data
            const response = await contact.create(formData);

            if (response.success) {
                toast.success(response.message || 'Message sent successfully!');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    mobileNumber: '',
                    message: ''
                });
                setErrors({});
            }
            else {
                toast.error(response.message || 'Something went wrong.');
            }
        } catch (error) {
            // Show error toast
            toast.error(error.response?.data?.message || 'Failed to send message');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-lg">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Contact Us</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
                {/* Name Input */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Mobile Number Input */}
                <div className="mb-4">
                    <label htmlFor="mobileNumber" className="block text-gray-700 font-semibold mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="tel"
                            id="mobileNumber"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
                </div>

                {/* Message Textarea */}
                <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none resize-none ${errors.message ? 'border-red-500' : 'border-gray-300'
                            }`}
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                >
                    <Send className="mr-2" size={20} />
                    Send Message
                </button>
            </form>
        </div>
    );
};

export default ContactPage;