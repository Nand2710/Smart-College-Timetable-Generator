import React, { useState, useEffect, useMemo } from 'react';
import {
    Copy,
    Search,
    UserCircle2,
    MailIcon,
    PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';
import { contact } from '../utils/api';
import ContactMessagesSkeleton from '../components/common/ContactMessagesSkeleton';

const ContactMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Fetch messages on component mount
    useEffect(() => {
        const loadMessages = async () => {
            try {
                setLoading(true);
                const data = await contact.getAll();
                setMessages(data.contacts);
                setLoading(false);
            } catch (err) {
                setError('Failed to load messages. Please try again.');
                toast.error('Failed to load messages', {
                    description: 'Please check your connection and try again.'
                });
                setLoading(false);
            }
        };

        loadMessages();
        // Optional: Set up periodic refresh
        const refreshInterval = setInterval(loadMessages, 60000);
        return () => clearInterval(refreshInterval);
    }, []);

    // Filtered and sorted messages
    const processedMessages = useMemo(() => {
        let filteredMessages = messages.filter(msg =>
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sorting logic
        switch (sortBy) {
            case 'newest':
                filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'oldest':
                filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'alphabetical':
                filteredMessages.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return filteredMessages;
    }, [messages, searchTerm, sortBy]);

    // Copy to clipboard handler
    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard`);
    };

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="px-4 sm:px-16 md:px-20 lg:px-24 mx-auto py-8 min-h-screen">
            {loading && <ContactMessagesSkeleton loading={loading} />}
            {/* Search and Sort Controls */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow flex items-center w-full">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded bg-gray-50 border-gray-300"
                    />
                    <Search className="absolute left-3 top-3 text-gray-400" />
                </div>

                <div className="flex items-center gap-2">
                    <span>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border text-sm rounded px-2 py-1 bg-gray-50 border-gray-300"
                    >
                        <option value="newest" className='text-xs'>Newest First</option>
                        <option value="oldest" className='text-xs'>Oldest First</option>
                        <option value="alphabetical" className='text-xs'>Alphabetical</option>
                    </select>
                </div>
            </div>

            {/* Messages List */}
            {processedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <UserCircle2 className="w-24 h-24 text-gray-300 mb-4" />
                    <p className="text-xl dark:text-gray-400">No messages found</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {processedMessages.map((message) => (
                        <div
                            key={message._id}
                            className="bg-gray-50 border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center mb-4">
                                <UserCircle2 strokeWidth={1} className="w-12 h-12 mr-4 text-gray-800" />
                                <div>
                                    <h3 className="font-semibold">{message.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(message.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center mb-2">
                                    <MailIcon className="mr-2 w-4 h-4 text-gray-500" />
                                    <a
                                        href={`mailto:${message.email}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {message.email}
                                    </a>
                                </div>
                                <div className="flex items-center mb-2">
                                    <PhoneCall className="mr-2 w-4 h-4 text-gray-500" />
                                    <span>{message.mobileNumber}</span>
                                </div>
                            </div>

                            <p className="mb-4 text-gray-700">
                                {message.message}
                            </p>

                            <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleCopy(message.email, 'Email')}
                                        className="hover:bg-gray-200 p-2 rounded"
                                    >
                                        <Copy className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                {message.message.length > 100 && (
                                    <button className="text-blue-600 text-sm">
                                        Read More
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactMessagesPage;