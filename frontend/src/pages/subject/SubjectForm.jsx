import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { subjectAPI } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';


// Zod schema for form validation
const subjectSchema = z.object({
    name: z.string().min(2, {
        message: "Subject name must be at least 2 characters."
    }).max(50, {
        message: "Subject name must not exceed 50 characters."
    }),
    code: z.string().min(2, {
        message: "Subject code must be at least 2 characters."
    }).max(10, {
        message: "Subject code must not exceed 10 characters."
    })
});

const SubjectForm = ({ toggleDialog, onSubmitSuccess, initialData = null }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        defaultValues: initialData ? {
            name: initialData.name || '',
            code: initialData.code || ''
        } : {
            name: '',
            code: ''
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (initialData) {
                // Edit existing subject
                const response = await subjectAPI.update(initialData._id, data);
                if (response.success) {
                    toast.success("Subject Updated.");
                    toggleDialog()
                }
                else {
                    toast.error(response.message)
                }
            } else {
                // Create new subject
                const response = await subjectAPI.create(data);
                if (response.success) {
                    toast.success("Subject Added.");
                    toggleDialog()
                }
                else {
                    toast.error(response.message)
                }
            }

            onSubmitSuccess && onSubmitSuccess();
            form.reset();
        } catch (error) {

            console.log(error);
            
            toast.error("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter subject name"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Provide a clear and concise subject name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject Code</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter subject code"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Unique identifier for the subject.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {initialData ? 'Update Subject' : 'Create Subject'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default SubjectForm;