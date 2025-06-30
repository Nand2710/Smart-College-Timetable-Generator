import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "../../components/ui/tooltip";
import {
    Edit2Icon,
    Trash2Icon,
    PlusIcon,
    SearchIcon,
    FileDownIcon,
    XIcon
} from "lucide-react";

import SubjectForm from '../subject/SubjectForm';
import { subjectAPI } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

const ManageSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [initialData, setInitialData] = useState(null)

    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const data = await subjectAPI.getAll();
            if (data.success) {
                setSubjects(data.subjects);
            } else {
                toast.error(data.message)
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch subjects');
            toast.error("Something went wrong.");
            setLoading(false);
        }
    };

    const filteredSubjects = useMemo(() => {
        return subjects.filter(subject =>
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subjects, searchTerm]);

    const handleDelete = async (id) => {
        try {
            await subjectAPI.delete(id);
            fetchSubjects();
            toast.success("Subject deleted.");
        } catch (err) {
            toast.error("Delete Denied");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedSubjects.length === 0) return;

        try {
            await Promise.all(selectedSubjects.map(id => subjectAPI.delete(id)));
            fetchSubjects();
            setSelectedSubjects([]);
            toast.success("Bulk deleted.");
            setIsMobileMenuOpen(false);
        } catch (err) {
            toast.error("Bulk Delete failed");
        }
    };

    const toggleSubjectSelection = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const isAllSelected = filteredSubjects.length > 0 &&
        selectedSubjects.length === filteredSubjects.length;

    const toggleSelectAll = () => {
        setSelectedSubjects(
            isAllSelected ? [] : filteredSubjects.map(subject => subject._id)
        );
    };

    const toggleDialog = () => {
        document.getElementById("dialogTrigger").click()
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-28">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left w-full">
                    Manage Subjects
                </h2>
                <div className="flex justify-center sm:justify-end w-full">
                    <Dialog>
                        <DialogTrigger id='dialogTrigger' />
                        <Button 
                            onClick={() => {
                                setInitialData(null)
                                toggleDialog()
                            }} 
                            className="flex items-center"
                        >
                            <PlusIcon className="mr-2" size={16} />
                            Add Subject
                        </Button>
                        <DialogContent className="max-w-[95%] sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Subject</DialogTitle>
                                <DialogDescription>
                                    Fill in the details for the new subject
                                </DialogDescription>
                            </DialogHeader>
                            <SubjectForm
                                toggleDialog={toggleDialog}
                                onSubmitSuccess={fetchSubjects}
                                initialData={initialData}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search and Bulk Actions Section */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full">
                    <SearchIcon
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <Input
                        placeholder="Search subjects by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-4 sm:py-5 pl-10"
                    />
                </div>
                {/* Mobile Bulk Action Trigger */}
                {selectedSubjects.length > 0 && (
                    <div className="w-full sm:hidden mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="w-full flex items-center justify-center"
                        >
                            {selectedSubjects.length} Subjects Selected
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile Bulk Action Modal */}
            {isMobileMenuOpen && selectedSubjects.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 bg-white shadow-lg z-50 p-4 sm:hidden">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-semibold">
                            {selectedSubjects.length} Subject(s) Selected
                        </p>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <XIcon size={24} />
                        </Button>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="w-full flex items-center justify-center"
                    >
                        <Trash2Icon className="mr-2" size={16} />
                        Delete Subjects
                    </Button>
                </div>
            )}

            {/* Desktop Bulk Delete Button */}
            <div className="hidden sm:block">
                {selectedSubjects.length > 0 && (
                    <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="flex items-center mt-4"
                    >
                        <Trash2Icon className="mr-2" size={16} />
                        Delete {selectedSubjects.length} Subject(s)
                    </Button>
                )}
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-left sm:text-center">Subject Name</TableHead>
                            <TableHead className="text-left sm:text-center hidden sm:table-cell">Subject Code</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubjects.map((subject) => (
                            <TableRow key={subject._id} className="hover:bg-gray-50">
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={selectedSubjects.includes(subject._id)}
                                        onCheckedChange={() => toggleSubjectSelection(subject._id)}
                                    />
                                </TableCell>
                                <TableCell className="text-left sm:text-center">
                                    <div className="flex flex-col sm:block">
                                        <span className="font-medium">{subject.name}</span>
                                        <span className="text-gray-500 sm:hidden text-sm">
                                            {subject.code}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-left sm:text-center hidden sm:table-cell">
                                    {subject.code}
                                </TableCell>
                                <TableCell className="text-center space-x-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setInitialData(subject)
                                                        toggleDialog()
                                                    }}
                                                >
                                                    <Edit2Icon className="text-blue-500" size={16} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Subject</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(subject._id)}
                                                >
                                                    <Trash2Icon className="text-red-500" size={16} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Subject</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* No Results Message */}
            {filteredSubjects.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No subjects found matching your search
                </div>
            )}
        </div>
    );
};

export default ManageSubjects;