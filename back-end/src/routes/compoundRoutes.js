const { Router } = require('express');
const compoundController = require('../controllers/compoundController');
const { optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, compoundController.listCompounds);
router.get('/:id', compoundController.getCompound);

module.exports = router;
