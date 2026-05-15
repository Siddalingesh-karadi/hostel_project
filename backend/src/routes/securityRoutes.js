const express = require('express');
const router = express.Router();
const { 
  getMyAssignment, sendAlert, assignSecurity, 
  getSecurityLocations, getAllAlerts 
} = require('../controllers/securityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/assignment', authorize('security'), getMyAssignment);
router.post('/alerts', authorize('security'), sendAlert);
router.post('/assign', authorize('admin'), assignSecurity);
router.get('/locations', authorize('admin'), getSecurityLocations);
router.get('/alerts', authorize('admin'), getAllAlerts);

module.exports = router;
