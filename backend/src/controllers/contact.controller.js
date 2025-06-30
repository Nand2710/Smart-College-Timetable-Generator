import Contact from '../models/Contact.js';

// Handle contact form submission
export const submitContactForm = async (req, res) => {
    try {
        // Extract form data from request body
        const { name, email, mobileNumber, message } = req.body;

        // Create new contact submission
        const newContact = new Contact({
            name,
            email,
            mobileNumber,
            message
        });

        // Save to database
        await newContact.save();

        // Respond with success message
        res.status(201).json({
            success: true,
            message: 'Your message has been submitted successfully!',
            contactId: newContact._id
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.json({
                success: false,
                message: 'Validation Error',
                errors: errorMessages
            });
        }

        // Handle other unexpected errors
        console.error('Contact form submission error:', error);
        res.json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        return res.json({ success: true, contacts });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Server error' });
    }
};
