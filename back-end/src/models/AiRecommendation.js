const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AiRecommendation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.STRING(30), defaultValue: 'tip' },
    message: { type: DataTypes.TEXT, allowNull: false },
    priority: { type: DataTypes.INTEGER, defaultValue: 1 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'ai_recommendations',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });
};
