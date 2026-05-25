const { Prediction } = require('../models');

const listPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20,
    });
    res.json({ success: true, data: predictions });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPredictions };
