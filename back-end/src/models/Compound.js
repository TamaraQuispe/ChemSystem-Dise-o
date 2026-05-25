const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Compound', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(64), allowNull: false },
    label: { type: DataTypes.STRING(120), allowNull: false },
    concentration: DataTypes.STRING(32),
    color_class: DataTypes.STRING(120),
    dot_class: DataTypes.STRING(64),
    formula: DataTypes.STRING(64),
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'compounds',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });
};
