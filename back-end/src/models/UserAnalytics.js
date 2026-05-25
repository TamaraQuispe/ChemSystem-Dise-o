const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UserAnalytics', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    total_experiments: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_yield: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    avg_accuracy: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    best_yield: { type: DataTypes.INTEGER, defaultValue: 0 },
    rank_position: DataTypes.INTEGER,
  }, {
    tableName: 'user_analytics',
    timestamps: true,
    createdAt: false,
    underscored: true,
  });
};
