const { db } = require('../config/db');

// @desc    Get assigned cleaning tasks for housekeeper
// @route   GET /api/housekeeper/tasks
exports.getMyTasks = async (req, res, next) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.*, r.room_number, r.block, r.floor 
      FROM cleaning_tasks t
      JOIN rooms r ON t.room_id = r.room_id
      WHERE t.housekeeper_id = ? AND t.task_date = CURDATE()
    `, [req.user.id]);

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (Mark as cleaned)
// @route   PUT /api/housekeeper/tasks/:id
exports.updateTaskStatus = async (req, res, next) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE cleaning_tasks SET status = ?, completed_at = ? WHERE task_id = ? AND housekeeper_id = ?',
      [status, status === 'completed' ? new Date() : null, req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign tasks (Admin only)
// @route   POST /api/housekeeper/assign
exports.assignTask = async (req, res, next) => {
  const { housekeeper_id, room_id, task_date } = req.body;
  try {
    await db.query(
      'INSERT INTO cleaning_tasks (housekeeper_id, room_id, task_date) VALUES (?, ?, ?)',
      [housekeeper_id, room_id, task_date]
    );

    res.status(201).json({ success: true, message: 'Task assigned successfully' });
  } catch (error) {
    next(error);
  }
};
