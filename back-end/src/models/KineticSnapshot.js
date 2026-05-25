const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('KineticSnapshot', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    experiment_id: { type: DataTypes.UUID, allowNull: false },
    time_label: { type: DataTypes.STRING(10), allowNull: false },
    yield_percent: { type: DataTypes.INTEGER, allowNull: false },
    stability_percent: { type: DataTypes.INTEGER, allowNull: false },
    is_prediction: { type: DataTypes.BOOLEAN, defaultValue: false },
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    recorded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'kinetic_snapshots',
    timestamps: false,
    underscored: true,
  });
};
