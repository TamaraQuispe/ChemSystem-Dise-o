const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    message: DataTypes.TEXT,
    type: { type: DataTypes.STRING(30), defaultValue: 'info' },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'notifications',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });
};
