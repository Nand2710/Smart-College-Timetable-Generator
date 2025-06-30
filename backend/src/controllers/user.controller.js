import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';
import MainTimeTable from '../models/MainTimeTable.js';
import TimeSlot from '../models/TimeSlot.js'
import DayTimeTable from '../models/DayTimetable.js';


// res.cookie('jwt', token, {
//   maxAge: 15 * 24 * 60 * 60 * 1000,
//   secure: isProduction,
//   httpOnly: true,
//   sameSite: "strict"
// });

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};


export const getDashboardData = async (req, res) => {
  try {
    // User Statistics
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPrincipals = await User.countDocuments({ role: 'principal' });

    // System Statistics
    const totalSubjects = await Subject.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalTimetables = await MainTimeTable.countDocuments();

    // User Role Distribution Chart
    const userRoleDistribution = [
      { name: 'Teachers', value: totalTeachers, color: '#0088FE' },
      { name: 'Students', value: totalStudents, color: '#00C49F' },
      { name: 'Admins', value: totalAdmins, color: '#FFBB28' },
      { name: 'Principals', value: totalPrincipals, color: '#FF8042' }
    ];

    // Classes Distribution
    const classDistribution = await Class.aggregate([
      {
        $project: {
          name: 1,
          studentCount: { $size: '$students' }
        }
      }
    ]);

    // Subject Growth (Monthly)
    const subjectGrowth = await Subject.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          subjects: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);


    res.json({
      success: true,
      data: {
        userStats: {
          totalTeachers,
          totalStudents,
          totalAdmins,
          totalPrincipals
        },
        systemStats: {
          totalSubjects,
          totalClasses,
          totalTimetables
        },
        charts: {
          userRoleDistribution,
          classDistribution,
          subjectGrowth
        }
      }
    });
  } catch (error) {
    res.json({
      successs: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedClass, subjects } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;

    if (role === 'teacher') {
      // Create the teacher user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        subjects,
      });

      // Update the subjects to include the teacher's ID
      if (subjects && subjects.length > 0) {
        await Subject.updateMany(
          { _id: { $in: subjects } }, // Match all subjects by IDs
          { $addToSet: { teachers: user._id } } // Add the teacher's ID to the teachers array
        );
      }
    } else if (role === 'student') {
      // Create the student user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        assignedClass,
      });

      // Update the class to include the student's ID
      if (assignedClass) {
        await Class.findByIdAndUpdate(
          assignedClass, // Find the class by ID
          { $addToSet: { students: user._id } } // Add the student's ID to the students array
        );
      }
    } else {
      // For other roles (e.g., admin, principal)
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
    }

    // Generate authentication token
    const token = generateToken(user._id);

    return res.json({
      success: true,
      user: {
        _id: user._id,
        assignedClass: user.assignedClass,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    return res.json({
      success: true,
      user: {
        _id: user._id,
        assignedClass: user.assignedClass,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: 'Error logging in', error: error.message });
  }
};



export const getTeacherDashboardData = async (req, res) => {
  try {
    const teacherId = req.user.id; // Assuming authenticated user ID from middleware

    // Fetch teacher details
    const teacher = await User.findById(teacherId).populate({
      path: 'subjects',
      model: 'Subject',
      select: 'name code'
    });

    if (!teacher) {
      return res.json({ success: false, message: 'Teacher not found' });
    }

    // Fetch all TimeSlots assigned to this teacher
    const teacherSlots = await TimeSlot.find({ teacher: teacherId });

    // Extract TimeSlot IDs for querying DayTimeTables
    const teacherSlotIds = teacherSlots.map(slot => slot._id);


    // Fetch DayTimeTables containing only this teacher's slots
    const dayTimeTables = await DayTimeTable.find({
      slots: { $in: teacherSlotIds }
    })
      .populate({
        path: 'slots',
        match: { teacher: teacherId }, // Ensure only this teacher's slots are populated
        populate: [
          { path: 'subject', model: 'Subject', select: 'name code' },
          { path: 'teacher', model: 'User', select: 'name' }
        ]
      })
      .populate({
        path: 'class',
        model: 'Class',
        select: 'name students'
      });

    // Organize schedule by day
    const scheduleByDay = {
      Monday: [], Tuesday: [], Wednesday: [],
      Thursday: [], Friday: [], Saturday: []
    };

    dayTimeTables.forEach(dayTable => {
      const day = dayTable.day; // Get the current day

      dayTable.slots.forEach(slot => {
        scheduleByDay[day].push({
          time: slot.time,
          type: slot.type,
          subject: {
            name: slot.subject?.name,
            code: slot.subject?.code
          },
          class: {
            name: dayTable.class.name,
            studentCount: dayTable.class.students.length
          }
        });
      });
    });

    // Fetch notifications
    const notifications = [
      {
        id: 1,
        message: 'Timetable updated for Thursday',
        type: 'info',
        timestamp: new Date()
      },
      {
        id: 2,
        message: 'Upcoming parent-teacher meeting',
        type: 'alert',
        timestamp: new Date()
      }
    ];

    // Fetch assigned classes with student details
    const assignedClasses = await Class.find({
      _id: { $in: dayTimeTables.map(dayTable => dayTable.class._id) }
    }).populate({
      path: 'students',
      model: 'User',
      select: 'name email'
    });

    // Compile final dashboard data
    const dashboardData = {
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email
      },
      subjects: teacher.subjects.map(subject => ({
        id: subject._id,
        name: subject.name,
        code: subject.code
      })),
      schedule: scheduleByDay,
      notifications,
      assignedClasses: assignedClasses.map(cls => ({
        id: cls._id,
        name: cls.name,
        studentCount: cls.students.length,
        students: cls.students.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email
        }))
      }))
    };

    res.json({
      success: true,
      dashboardData
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.json({
      success: false,
      message: 'Error fetching dashboard data',
    });
  }
};



export const getPrincipalDashboardData = async (req, res) => {
  try {
    const principalId = req.user.id; // Assuming authenticated user ID from middleware

    // Fetch principal details
    const principal = await User.findById(principalId);

    if (!principal) {
      return res.json({ success: false, message: 'Principal not found' });
    }

    // Fetch all subjects for overview
    const subjects = await Subject.find().select('name code');

    // Fetch all DayTimeTables for complete schedule overview
    const dayTimeTables = await DayTimeTable.find()
      .populate({
        path: 'slots',
        populate: [
          { path: 'subject', model: 'Subject', select: 'name code' },
          { path: 'teacher', model: 'User', select: 'name' }
        ]
      })
      .populate({
        path: 'class',
        model: 'Class',
        select: 'name students'
      });

    // Organize schedule by day for overview
    const scheduleByDay = {
      Monday: [], Tuesday: [], Wednesday: [],
      Thursday: [], Friday: [], Saturday: []
    };

    dayTimeTables.forEach(dayTable => {
      const day = dayTable.day;

      dayTable.slots.forEach(slot => {
        scheduleByDay[day].push({
          time: slot.time,
          type: slot.type,
          subject: {
            name: slot.subject?.name,
            code: slot.subject?.code
          },
          class: {
            name: dayTable.class.name,
            id: dayTable.class._id
          }
        });
      });
    });

    // Generate notifications for principal
    const notifications = [
      {
        id: 1,
        message: 'Weekly timetable review completed',
        type: 'info',
        timestamp: new Date()
      },
      {
        id: 2,
        message: 'New teacher registration pending approval',
        type: 'alert',
        timestamp: new Date()
      },
      {
        id: 3,
        message: 'Monthly academic report is ready',
        type: 'info',
        timestamp: new Date()
      }
    ];

    // Get system statistics
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClasses = await Class.countDocuments();

    // Compile final dashboard data
    const dashboardData = {
      principal: {
        id: principal._id,
        name: principal.name,
        email: principal.email
      },
      subjects: subjects.map(subject => ({
        id: subject._id,
        name: subject.name,
        code: subject.code
      })),
      schedule: scheduleByDay,
      notifications,
      systemStats: {
        totalTeachers,
        totalStudents,
        totalClasses,
        totalSubjects: subjects.length
      }
    };

    res.json({
      success: true,
      dashboardData
    });
  } catch (error) {
    console.error('Principal dashboard data fetch error:', error);
    res.json({
      success: false,
      message: 'Error fetching dashboard data',
    });
  }
};



export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').populate('subjects');
    return res.json({ success: true, teachers });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching teachers', error: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').populate({
      path: 'assignedClass',
      model: 'Class',
      select: 'name'
    });
    return res.json({ success: true, students });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching students', error: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    return res.json({ success: true, admins });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching admins', error: error.message });
  }
};

export const getAllPrincipals = async (req, res) => {
  try {
    const principals = await User.find({ role: 'principal' }).select('-password');
    return res.json({ success: true, principals });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching principals', error: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await User.findByIdAndDelete(id);
    return res.json({ success: true, students });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching students', error: error.message });
  }
};