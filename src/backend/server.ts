import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Protects against common web vulnerabilities by setting HTTP headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true // Required for secure HTTP-only cookies
}));
app.use(express.json({ limit: '10kb' })); // Strict input payload limit

// Rate Limiting to prevent DoS/Brute Force
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Health Check & DP Analytics Stub
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Secure API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Secure backend listening on port ${PORT}`);
});