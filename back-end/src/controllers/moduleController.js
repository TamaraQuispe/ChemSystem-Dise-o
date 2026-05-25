const { Module, UserModule } = require('../models');

const listModules = async (req, res, next) => {
  try {
    const modules = await Module.findAll({
      where: { is_published: true },
      order: [['order_index', 'ASC']],
    });

    if (req.user) {
      const progress = await UserModule.findAll({ where: { user_id: req.user.id } });
      const progressMap = Object.fromEntries(progress.map((p) => [p.module_id, p]));

      const enriched = modules.map((m) => ({
        ...m.toJSON(),
        userProgress: progressMap[m.id] || null,
      }));
      return res.json({ success: true, data: enriched });
    }

    res.json({ success: true, data: modules });
  } catch (err) {
    next(err);
  }
};

const getModule = async (req, res, next) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ success: false, message: 'Módulo no encontrado' });

    let userProgress = null;
    if (req.user) {
      userProgress = await UserModule.findOne({
        where: { user_id: req.user.id, module_id: module.id },
      });
    }

    res.json({ success: true, data: { ...module.toJSON(), userProgress } });
  } catch (err) {
    next(err);
  }
};

module.exports = { listModules, getModule };
