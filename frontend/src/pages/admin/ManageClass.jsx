import React, { useState, useEffect } from 'react';
import {
    EditIcon,
    TrashIcon,
    PlusIcon,
    SearchIcon,
    FilterIcon,
    UsersIcon,
    CalendarIcon,
    WrenchIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { classAPI } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const ManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Class name is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const data = await classAPI.create(formData);
            if (data.success) {
                toast.success("Class added successfully.")
                navigate("/admin/classes")
                setFormData({
                    name: "",
                })
                document.getElementById('closeButton').click()
                fetchClasses()
                return;
            }
            toast.error(data.message)
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong.")
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const data = await classAPI.getAll();

            if (data.success) {
                const enhancedClasses = data.classes.map(cl => ({
                    ...cl,
                    studentCount: cl.students.length,
                    teacherCount: cl.teachers?.length || 0
                }));

                setClasses(enhancedClasses);
                setFilteredClasses(enhancedClasses);
            } else {
                setError("Failed to fetch classes");
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch classes');
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = classes.filter(
            (cl) =>
                cl.name.toLowerCase().includes(term) ||
                cl.code?.toLowerCase().includes(term)
        );
        setFilteredClasses(filtered);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await classAPI.delete(id);
                fetchClasses();
            } catch (err) {
                setError('Failed to delete class');
            }
        }
    };

    // Prepare data for student count chart
    const classStudentData = filteredClasses.map(cl => ({
        name: cl.name,
        students: cl.studentCount
    }));

    return (
        <div className="mx-auto px-4 md:px-10 lg:px-20 p-4 md:p-6 pb-28">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mb-4 md:mb-6">
                <Card className="col-span-1 md:col-span-3">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                            <CardTitle className="text-base md:text-lg mb-3">Class Management</CardTitle>
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search classes..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full pl-8 pr-2 py-1 md:py-2 text-xs md:text-sm border rounded"
                                    />
                                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                <button variant="outline" size="icon" className="p-1 md:p-2">
                                    <FilterIcon size={16} md:size={20} />
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center text-xs md:text-sm">Loading...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border p-2 md:p-3">Class Name</th>
                                            <th className="border p-2 md:p-3 hidden md:table-cell">Students</th>
                                            <th className="border p-2 md:p-3 table-cell">Timetable</th>
                                            <th className="border p-2 md:p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-center'>
                                        {filteredClasses.map((cl) => (
                                            <tr key={cl._id} className="hover:bg-gray-50">
                                                <td className="border p-2 md:p-3">
                                                    <div className="flex items-center justify-center">
                                                        <Badge variant="outline" className="mr-1 md:mr-2 text-[0.6rem] md:text-xs">
                                                            {cl.code || 'N/A'}
                                                        </Badge>
                                                        <span className="text-xs md:text-sm">{cl.name}</span>
                                                    </div>
                                                </td>
                                                <td className="border p-2 md:p-3 hidden md:table-cell">
                                                    <div className="flex items-center justify-center">
                                                        <UsersIcon size={14} md:size={16} className="mr-1 md:mr-2 text-blue-500" />
                                                        {cl.studentCount}
                                                    </div>
                                                </td>
                                                <td className="border p-2 md:p-3 table-cell">
                                                    <div className='flex items-center justify-center gap-1 md:gap-2'>
                                                        {cl?.timetable && <Link
                                                            to={`/timetables/overview/${cl._id}`}
                                                            className="text-green-500 hover:text-green-700 p-1 md:p-3"
                                                        >
                                                            <CalendarIcon className='mx-auto' size={16} md:size={20} />
                                                        </Link>}
                                                        <Link
                                                            to={`/admin/timetables/${cl._id}`}
                                                            className="text-zinc-500 hover:text-zinc-700 p-1 md:p-3"
                                                        >
                                                            <WrenchIcon size={16} md:size={20} />
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="border p-2 md:p-3 text-center">
                                                    <button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(cl._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <TrashIcon size={16} md:size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 hidden md:block">
                    <CardHeader>
                        <CardTitle className="text-base md:text-lg">Students per Class</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 md:pt-16">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classStudentData}>
                                <XAxis dataKey="name" />
                                <YAxis tickCount={1} />
                                <Tooltip />
                                <Bar dataKey="students" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Add Class Dialog */}
            <Dialog>
                <DialogTrigger id='closeButton' asChild>
                    <button variant="default" className="fixed bottom-4 md:bottom-6 right-4 md:right-6 rounded-full shadow-lg bg-white text-black flex items-center justify-center gap-1 border-2 border-zinc-200 p-2 md:p-3">
                        <PlusIcon className="mr-1 md:mr-2" size={16} md:size={20} />
                        <span className="text-xs md:text-sm">Add Class</span>
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-[400px] md:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-base md:text-lg">Create New Class</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Subject Name */}
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                                    Class Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full px-2 py-1 md:px-4 md:py-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm`}
                                    placeholder="Enter class name"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-1 md:py-2 px-2 md:px-4 rounded-md hover:bg-blue-600 transition-colors text-xs md:text-sm"
                            >
                                Add Class
                            </button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {error && (
                <div className="bg-red-100 text-red-700 p-2 md:p-3 rounded fixed bottom-4 md:bottom-6 left-4 md:left-6 text-xs md:text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ManageClasses;