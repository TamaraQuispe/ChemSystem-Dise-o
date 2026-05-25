const { Notification } = require('../models');

const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    res.json({ success: true, data: notifications, meta: { unreadCount } });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    await notification.update({ is_read: true });
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true, message: 'Todas marcadas como leídas' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listNotifications, markAsRead, markAllRead };
