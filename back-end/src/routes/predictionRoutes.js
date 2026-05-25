const { Router } = require('express');
const predictionController = require('../controllers/predictionController');
const { authenticate } = require('../middlewares/auth');

const router = Router();
router.use(authenticate);
router.get('/', predictionController.listPredictions);

module.exports = router;
