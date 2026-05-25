const { UserAnalytics, Prediction, User } = require('../models');

const getMyAnalytics = async (req, res, next) => {
  try {
    let analytics = await UserAnalytics.findOne({ where: { user_id: req.user.id } });
    if (!analytics) {
      analytics = await UserAnalytics.create({ user_id: req.user.id });
    }

    const recentPredictions = await Prediction.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['yield_percent', 'stability_percent', 'accuracy_percent', 'created_at'],
    });

    res.json({
      success: true,
      data: {
        ...analytics.toJSON(),
        recentPredictions,
        user: { level: req.user.level, xp: req.user.xp },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getRankings = async (req, res, next) => {
  try {
    const rankings = await UserAnalytics.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url', 'level'] }],
      order: [['avg_yield', 'DESC']],
      limit: 10,
    });
    res.json({ success: true, data: rankings });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAnalytics, getRankings };
