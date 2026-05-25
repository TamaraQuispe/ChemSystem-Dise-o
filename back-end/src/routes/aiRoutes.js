const { Router } = require('express');
const aiController = require('../controllers/aiController');

const router = Router();
router.get('/recommendations', aiController.getRecommendations);

module.exports = router;
