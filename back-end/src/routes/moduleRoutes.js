const { Router } = require('express');
const moduleController = require('../controllers/moduleController');
const { optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, moduleController.listModules);
router.get('/:id', optionalAuth, moduleController.getModule);

module.exports = router;
