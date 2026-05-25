const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Prediction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    experiment_id: DataTypes.UUID,
    user_id: { type: DataTypes.UUID, allowNull: false },
    yield_percent: { type: DataTypes.INTEGER, allowNull: false },
    stability_percent: { type: DataTypes.INTEGER, allowNull: false },
    energy_value: DataTypes.DECIMAL(8, 2),
    atoms_count: DataTypes.INTEGER,
    risk_level: DataTypes.STRING(20),
    global_state: DataTypes.STRING(20),
    catalyst_efficiency: DataTypes.INTEGER,
    enthalpy: DataTypes.DECIMAL(10, 2),
    entropy: DataTypes.DECIMAL(10, 2),
    accuracy_percent: DataTypes.INTEGER,
    estimated_time: DataTypes.STRING(20),
  }, {
    tableName: 'predictions',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });
};
