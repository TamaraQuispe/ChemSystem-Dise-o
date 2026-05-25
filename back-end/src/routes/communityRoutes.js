const { Router } = require('express');
const { body } = require('express-validator');
const communityController = require('../controllers/communityController');
const validate = require('../middlewares/validate');
const { authenticate, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, communityController.listPosts);
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Título requerido'),
    body('content').optional().trim(),
  ],
  validate,
  communityController.createPost
);

module.exports = router;
