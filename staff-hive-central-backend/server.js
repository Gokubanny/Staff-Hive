// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import companyRoutes from './routes/companies.js';
import applicantRoutes from './routes/applicants.js';
import payrollRoutes from './routes/payroll.js';
import jobRoutes from './routes/jobs.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import eventsRoutes from './routes/events.js';
import notificationsRoutes from './routes/notifications.js';
import { auth } from './middleware/auth.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// CORS - allow multiple origins
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/staff-hive-central';
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};
connectDB();

// Rate Limiter
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Staff Hive Central API is running!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: '1.0.0',
  });
});

app.get('/', (req, res) => res.json({ success: true, message: 'Welcome to Staff Hive Central API!' }));

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS policy violation' });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Frontend allowed origins: http://localhost:8080, http://localhost:3000, http://localhost:5173`);
});