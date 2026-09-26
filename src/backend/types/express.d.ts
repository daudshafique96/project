// Extends Express Request to include the authenticated user payload
// populated by JWT middleware before ABAC/route handlers run.
declare namespace Express {
    interface Request {
        user: {
            id: string;
            role: 'Admin' | 'Teacher' | 'Student';
        };
    }
}
