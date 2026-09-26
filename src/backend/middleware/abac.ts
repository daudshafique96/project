import type { Request, Response, NextFunction } from 'express';
import pool from '../db/index.js'; // pg pool

export const authorizeTeacherForStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teacherId = req.user.id; // Extracted from JWT middleware
        const studentId = req.params.studentId;

        // ABAC Policy: Check if the teacher owns a course the student is enrolled in
        const query = `
            SELECT 1 FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE c.teacher_id = $1 AND e.student_id = $2
            LIMIT 1;
        `;
        const result = await pool.query(query, [teacherId, studentId]);

        if (result.rowCount === 0) {
            return res.status(403).json({ error: 'ABAC Violation: You are not authorized to view this student\'s records.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization policy evaluation failed' });
    }
};