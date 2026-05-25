const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const compoundRoutes = require('./compoundRoutes');
const experimentRoutes = require('./experimentRoutes');
const moduleRoutes = require('./moduleRoutes');
const predictionRoutes = require('./predictionRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const aiRoutes = require('./aiRoutes');
const communityRoutes = require('./communityRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/compounds', compoundRoutes);
router.use('/experiments', experimentRoutes);
router.use('/modules', moduleRoutes);
router.use('/predictions', predictionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/community', communityRoutes);

module.exports = router;
