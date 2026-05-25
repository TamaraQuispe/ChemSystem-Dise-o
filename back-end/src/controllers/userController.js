const { User, UserAnalytics } = require('../models');

const listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: UserAnalytics, as: 'analytics' }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sin permisos' });
    }

    const { name, avatar_url, level, xp } = req.body;
    await user.update({ name, avatar_url, level, xp });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Solo administradores' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    await user.destroy();
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUser, updateUser, deleteUser };
