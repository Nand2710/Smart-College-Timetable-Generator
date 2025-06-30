import React, { useState, useEffect } from 'react';
import { EditIcon, TrashIcon, FilterIcon, SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

const ManageUsers = () => {
    const [users, setUsers] = useState({
        teachers: [],
        students: [],
        admins: []
    });
    const [filteredUsers, setFilteredUsers] = useState({
        teachers: [],
        students: [],
        admins: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('teachers');
    const navigate = useNavigate();
    const [usersDistribution, setUsersDistribution] = useState([])

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const [teacherData, studentData, adminData] = await Promise.all([
                authAPI.getAllTeachers(),
                authAPI.getAllStudents(),
                authAPI.getAllAdmins()
            ]);

            const updatedUsers = {
                teachers: teacherData.teachers,
                students: studentData.students,
                admins: adminData.admins
            };

            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);

            setUsersDistribution([
                { name: 'Teachers', value: updatedUsers.teachers.length, fill: '#0088FE' },
                { name: 'Students', value: updatedUsers.students.length, fill: '#00C49F' },
                { name: 'Admins', value: updatedUsers.admins.length, fill: '#FFBB28' }
            ])

            setLoading(false);
        } catch (err) {
            console.log(err);
            setError('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filterUsers = (userList) =>
            userList.filter(user =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
            );

        setFilteredUsers({
            teachers: filterUsers(users.teachers),
            students: filterUsers(users.students),
            admins: filterUsers(users.admins)
        });
    };

    const handleDeleteUser = async (id, role) => {
        if (window.confirm(`Are you sure you want to delete this ${role}?`)) {
            try {
                await authAPI.delete(id);
                setUsers(prev => ({
                    ...prev,
                    [role + 's']: prev[role + 's'].filter(user => user._id !== id)
                }));
                setFilteredUsers(prev => ({
                    ...prev,
                    [role + 's']: prev[role + 's'].filter(user => user._id !== id)
                }));
            } catch (err) {
                setError(`Failed to delete ${role}`);
            }
        }
    };

    const renderUserTable = (users, role) => (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2 md:p-3">Name</th>
                        <th className="border p-2 md:p-3">Email</th>
                        {role === 'teacher' && <th className="border p-2 md:p-3 hidden md:table-cell">Subjects</th>}
                        {role === 'student' && <th className="border p-2 md:p-3 hidden md:table-cell">Class</th>}
                        <th className="border p-2 md:p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                            <td className="border p-2 md:p-3">{user.name}</td>
                            <td className="border p-2 md:p-3 lowercase">{user.email}</td>
                            {role === 'teacher' && (
                                <td className="border p-2 md:p-3 hidden md:table-cell">
                                    {user.subjects.map((subject) => (
                                        <span key={subject._id} className="p-1 bg-blue-50 rounded mr-1 text-xs md:text-sm">
                                            {subject.name}
                                        </span>
                                    ))}
                                </td>
                            )}
                            {role === 'student' && (
                                <td className="border p-2 md:p-3 hidden md:table-cell">{user.assignedClass?.name || 'Not Assigned'}</td>
                            )}
                            <td className="border p-2 md:p-3 text-center">
                                {activeTab !== "admins" && <button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteUser(user._id, role)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <TrashIcon size={16} md:size={20} />
                                </button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="mx-auto px-4 md:px-10 lg:px-20 p-4 md:p-6 pb-28">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
                <Card className="col-span-1 md:col-span-3">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                            <CardTitle className="text-base md:text-lg mb-3">User Management</CardTitle>
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab}...`}
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full pl-8 pr-2 py-1 md:py-2 text-xs md:text-sm border rounded"
                                    />
                                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                <button variant="outline" size="icon" className="p-1 md:p-2">
                                    <FilterIcon className='text-black' size={16} md:size={20} />
                                </button>
                            </div>
                        </div>
                    </CardHeader>  
                    <CardContent>
                        <div className="mb-2 md:mb-4 border-b">
                            <nav className="-mb-px flex space-x-2 md:space-x-4 overflow-x-auto">
                                {['teachers', 'students', 'admins'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            py-1 md:py-2 px-2 md:px-4 border-b-2 font-medium text-xs md:text-sm 
                                            ${activeTab === tab
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {loading ? (
                            <div className="text-center text-xs md:text-sm">Loading...</div>
                        ) : (
                            <div className='overflow-auto h-[40vh] md:h-[57vh]'>
                                {activeTab === 'teachers' && renderUserTable(filteredUsers.teachers, 'teacher')}
                                {activeTab === 'students' && renderUserTable(filteredUsers.students, 'student')}
                                {activeTab === 'admins' && renderUserTable(filteredUsers.admins, 'admin')}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 hidden md:block">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg">User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350} className={'mt-6 md:mt-10'}>
                            <PieChart>
                                <Pie
                                    data={usersDistribution}
                                    cx="50%"
                                    cy="50%"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {usersDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-2 md:p-3 rounded fixed bottom-4 md:bottom-6 left-4 md:left-6 text-xs md:text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ManageUsers;