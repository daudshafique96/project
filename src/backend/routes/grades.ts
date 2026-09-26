import { Router } from 'express';
import pool from '../db/index.js';
import { authorizeTeacherForStudent } from '../middleware/abac.js';
import { getDifferentiallyPrivateAverage } from '../utils/differentialPrivacy.js';

const router = Router();

// Endpoint 1: Fetch a specific student's grade (Protected by ABAC)
router.get('/students/:studentId/grades', authorizeTeacherForStudent, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // At this point, the ABAC middleware has already verified the teacher is authorized
        const query = `
            SELECT g.score, g.encrypted_medical_note 
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            WHERE e.student_id = $1;
        `;
        const result = await pool.query(query, [studentId]);
        
        // Note: Decrypt 'encrypted_medical_note' here using application-level AES-256-GCM logic before sending
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch student records' });
    }
});

// Endpoint 2: Advanced Feature - Differentially Private Cohort Analytics
router.get('/courses/:courseId/analytics', async (req, res) => {
    try {
        const { courseId } = req.params;
        const teacherId = req.user.id; // From JWT middleware

        // 1. Verify Teacher owns this course (RBAC/ABAC check)
        const courseCheck = await pool.query('SELECT 1 FROM courses WHERE id = $1 AND teacher_id = $2', [courseId, teacherId]);
        if (courseCheck.rowCount === 0) {
            return res.status(403).json({ error: 'Unauthorized course access' });
        }

        // 2. Fetch all true grades for the cohort
        const query = `
            SELECT g.score 
            FROM grades g
            JOIN enrollments e ON g.enrollment_id = e.id
            WHERE e.course_id = $1;
        `;
        const result = await pool.query(query, [courseId]);
        
        // Extract raw scores into a number array
        const rawGrades = result.rows.map(row => parseFloat(row.score));

        // 3. Apply Differential Privacy (Epsilon = 1.0 for strict privacy)
        const privateAverage = getDifferentiallyPrivateAverage(rawGrades, 1.0);

        res.status(200).json({
            course_id: courseId,
            differentially_private_average: privateAverage,
            message: 'Noise injected to protect individual student data.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

export default router;