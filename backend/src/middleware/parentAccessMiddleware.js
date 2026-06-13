const { db } = require('../config/db');

/**
 * Middleware to resolve a parent's linked student_id(s) and attach to req.
 * Ensures parents can ONLY access their linked student's data.
 */
exports.resolveParentStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'parent') {
      return next(); // Non-parent roles skip this middleware
    }

    const [mappings] = await db.query(
      'SELECT student_id FROM parent_student_mapping WHERE parent_user_id = ?',
      [req.user.id]
    );

    if (mappings.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No student linked to your account. Contact the hostel administration.'
      });
    }

    // Attach linked student IDs to the request
    req.linkedStudentIds = mappings.map(m => m.student_id);
    req.linkedStudentId = mappings[0].student_id; // Primary linked student

    next();
  } catch (error) {
    next(error);
  }
};
