import React, { useState } from "react";
import { classAPI } from "../../utils/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AddClass = () => {
    const [formData, setFormData] = useState({
        name: "",
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name } = e.target;
        const { value } = e.target;
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
                toast.success("Class added succefully.")
                navigate("/admin/classes/manage")
                return;
            }
            toast.error(data.message)
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong.")
        }

    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">Add New class</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Subject Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                            Class Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter class name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Add Class
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddClass;
