import express from 'express';
import { getAllContacts, submitContactForm } from '../controllers/contact.controller.js';

const router = express.Router();

// POST route for contact form submission
router.post('/', submitContactForm);
router.get('/', getAllContacts);

export default router;