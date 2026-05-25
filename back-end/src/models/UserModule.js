const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserModule', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    module_id: { type: DataTypes.UUID, allowNull: false },
    progress_percent: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'not_started' },
    started_at: DataTypes.DATE,
    completed_at: DataTypes.DATE,
  }, {
    tableName: 'user_modules',
    timestamps: false,
    underscored: true,
  });
};
