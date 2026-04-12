const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const { startCron } = require('./cron/vaccineCron');

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(logger);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running successfully.' });
});

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const parentRoutes = require('./routes/parent.routes');
const doctorRoutes = require('./routes/doctor.routes');
const facilityRoutes = require('./routes/facility.routes');
const childRoutes = require('./routes/child.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const healthRecordRoutes = require('./routes/healthRecord.routes');
const vaccinationRoutes = require('./routes/vaccination.routes');
const growthRoutes = require('./routes/growthRecord.routes');
const teleconsultRoutes = require('./routes/teleconsultation.routes');
const educationRoutes = require('./routes/education.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const chatRoutes = require('./routes/chat.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/facilities', facilityRoutes);
app.use('/api/v1/children', childRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/health-records', healthRecordRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes); // Retained for backwards compatibility if needed
app.use('/api/v1/vaccinations', vaccinationRoutes);
app.use('/api/v1/growth', growthRoutes);
app.use('/api/v1/teleconsultations', teleconsultRoutes);
app.use('/api/v1/education', educationRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/chat', chatRoutes);

// Global Error Handler must be the last middleware
app.use(errorHandler);

// Engage Automated Status Transition Modules
startCron();

module.exports = app;
