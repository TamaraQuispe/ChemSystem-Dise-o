const { AiRecommendation } = require('../models');

const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await AiRecommendation.findAll({
      where: { is_active: true },
      order: [['priority', 'ASC']],
    });
    res.json({ success: true, data: recommendations });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
