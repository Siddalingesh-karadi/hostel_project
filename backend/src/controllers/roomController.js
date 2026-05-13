const { db } = require('../config/db');

// @desc    Get all rooms
// @route   GET /api/rooms
exports.getAllRooms = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM rooms');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new room
// @route   POST /api/rooms
exports.addRoom = async (req, res, next) => {
  const { room_number, block, floor, capacity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO rooms (room_number, block, floor, capacity) VALUES (?, ?, ?, ?)',
      [room_number, block, floor, capacity]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, room_number, block, floor, capacity } });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate room to student
// @route   POST /api/rooms/allocate
exports.allocateRoom = async (req, res, next) => {
  const { student_id, room_id } = req.body;
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check if student already has a room
    const [studentCheck] = await conn.query('SELECT room_id FROM students WHERE student_id = ? FOR UPDATE', [student_id]);
    if (studentCheck.length === 0) throw new Error('Student not found');
    if (studentCheck[0].room_id) throw new Error('Student is already allocated to a room');

    // 2. Check room availability
    const [rooms] = await conn.query('SELECT * FROM rooms WHERE room_id = ? FOR UPDATE', [room_id]);
    if (rooms.length === 0) throw new Error('Room not found');
    if (rooms[0].occupied >= rooms[0].capacity) throw new Error('Room is full');

    // 2. Update Student
    await conn.query('UPDATE students SET room_id = ? WHERE student_id = ?', [room_id, student_id]);

    // 3. Update Room Occupancy
    const newOccupied = rooms[0].occupied + 1;
    const newStatus = newOccupied === rooms[0].capacity ? 'full' : 'available';
    await conn.query('UPDATE rooms SET occupied = ?, status = ? WHERE room_id = ?', [newOccupied, newStatus, room_id]);

    await conn.commit();
    res.json({ success: true, message: 'Room allocated successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

// @desc    Deallocate room
// @route   POST /api/rooms/deallocate
exports.deallocateRoom = async (req, res, next) => {
  const { student_id, room_id } = req.body;
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Remove from student
    await conn.query('UPDATE students SET room_id = NULL WHERE student_id = ?', [student_id]);

    // 2. Decrement room occupancy
    const [rooms] = await conn.query('SELECT * FROM rooms WHERE room_id = ? FOR UPDATE', [room_id]);
    const newOccupied = Math.max(0, rooms[0].occupied - 1);
    await conn.query('UPDATE rooms SET occupied = ?, status = "available" WHERE room_id = ?', [newOccupied, room_id]);

    await conn.commit();
    res.json({ success: true, message: 'Room deallocated successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

exports.updateRoom = async (req, res, next) => {
  const { room_number, block, capacity } = req.body;
  try {
    await db.query(
      'UPDATE rooms SET room_number = ?, block = ?, capacity = ? WHERE room_id = ?',
      [room_number, block, capacity, req.params.id]
    );
    res.json({ success: true, message: 'Room updated' });
  } catch (error) {
    next(error);
  }
};
