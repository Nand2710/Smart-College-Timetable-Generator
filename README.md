# Smart College Timetable Generator

## 📝 Introduction

The **Smart College Timetable Generator** is a full-stack web application built to automate the scheduling of lectures for colleges and universities. It simplifies the process of assigning subjects, teachers, and time slots while preventing conflicts in schedules. The system is designed to help academic institutions manage complex timetabling efficiently.

---

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Future Scope](#future-scope)

---

## 📌 Project Overview

This project is a **Smart Timetable Management System** that allows administrators to generate optimized weekly timetables for different departments, classrooms, and teachers. The system ensures that no faculty or subject is occur twice at the same time, and that subject-hour constraints are respected.

It provides a web interface for managing teachers, subjects, and schedules, and then automatically creates a non-conflicting timetable using custom logic and constraints.

---

## 🌟 Features

1. **Admin Dashboard**
   - Add/Edit/Delete teachers, classrooms, and subjects
   - Assign subjects to teachers and departments

2. **Automated Timetable Generation**
   - Prevents overlapping sessions
   - Ensures availability of faculty and rooms
   - Allocates lectures based on subject hour requirements

3. **Secure Authentication**
   - Role-based login using JWT (JSON Web Tokens)
   - Admin-only access to timetable generation features

4. **Timetable Views**
   - Teacher-wise, class-wise, and department-wise timetable display
   - Exportable or printable timetable views

5. **Responsive Web Interface**
   - Clean and intuitive frontend using React.js
   - Fully responsive design for all devices

---

## 📂 Project Structure

# Project Structure

    .
    smart-college-timetable-generator/
    │
    ├── frontend/                         # React Frontend
    |       ├── public/                     # Static files like index.html
    |       └── src/
    |	├── components/             # Reusable UI components
    |	├── pages/                  # Route-based pages
    │            ├── services/               # Axios services for API calls
    │            ├── App.js                  # Main App component
    │            └── index.js                # Entry point for React
    │       
    ├── backend/                         # Backend (Node.js + Express)
    │   ├── controllers/                # Route handler logic
    │   ├── models/                     # Mongoose models
    │   ├── routes/                     # API route definitions
    │   ├── middleware/                 # Authentication & error handling
    │   ├── config/                     # DB connection and configs
    │   └── server.js                   # Express app entry point
    │
    ├── .env                            # Environment variables
    ├── package.json                    # Node.js dependencies & scripts
    └── timetable-algorithm/            # (Optional) Folder for timetable generation logic
    ├── algorithm.js                # Core logic for conflict-free schedule generation
    └── utils.js                    # Helper functions for scheduling
    |
    └── README.md

---

## 🛠️ Technologies Used

### ⚙️ Frontend:
- React.js
- Bootstrap or Tailwind CSS
- Axios

### 🖥️ Backend:
- Node.js
- Express.js
- MongoDB
- JSON Web Token (JWT)

### 🗃️ Database:
- MongoDB (Compass/Atlas)

---

## ⚙️ Installation

1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-college-timetable-generator.git
cd smart-college-timetable-generator
```

2. Setup Backend
```bash
cd backend
npm install
npm start
```

3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```
---

## 🧪 Usage

1. Log in using admin credentials
2. Navigate to admin dashboard
3. Add departments, subjects, teachers, and rooms
4. Assign subjects to teachers
5. Generate timetable
6. View timetable by class or teacher

---

##  🚀 Future Scope

1. Add AI-based optimization for real-time timetable conflict resolution
2. Export timetable as Excel or other formats
3. Role-based access (HOD, Teacher, Student views)
4. Notifications and calendar sync
5. Mobile app integration

--- 
