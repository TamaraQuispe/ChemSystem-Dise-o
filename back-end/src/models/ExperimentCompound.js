const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ExperimentCompound', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    experiment_id: { type: DataTypes.UUID, allowNull: false },
    compound_id: { type: DataTypes.UUID, allowNull: false },
    added_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'experiment_compounds',
    timestamps: false,
    underscored: true,
  });
};
