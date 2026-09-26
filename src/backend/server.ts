import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 1. Import your route controllers
import gradesRouter from './routes/grades.js'; 
// import authRouter from './routes/auth'; // Add this when you create your auth routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// 2. Register the routes
app.use('/api', gradesRouter); 

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Secure API is running' });
});

// 3. Add a Secure 404 Catch-All Handler
// This prevents Express from leaking stack traces or default HTML pages during ZAP scans
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Secure backend listening on port ${PORT}`);
});