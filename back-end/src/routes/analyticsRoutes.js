const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/rankings', optionalAuth, analyticsController.getRankings);
router.get('/me', authenticate, analyticsController.getMyAnalytics);

module.exports = router;
