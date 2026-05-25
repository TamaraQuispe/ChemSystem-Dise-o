const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Module', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: DataTypes.TEXT,
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    difficulty: { type: DataTypes.STRING(20), defaultValue: 'intermediate' },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'modules',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });
};
