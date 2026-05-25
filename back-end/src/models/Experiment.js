const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Experiment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), defaultValue: 'Experimento de Catálisis' },
    status: { type: DataTypes.STRING(20), defaultValue: 'active' },
    temperature: { type: DataTypes.DECIMAL(6, 2), defaultValue: 298 },
    pressure: { type: DataTypes.DECIMAL(6, 2), defaultValue: 1.2 },
    conc_a: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.5 },
    conc_b: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.2 },
    active_timeline_step: { type: DataTypes.STRING(20), defaultValue: 'Transición' },
    zoom_level: { type: DataTypes.DECIMAL(4, 2), defaultValue: 1 },
    show_grid: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'experiments',
    timestamps: true,
    underscored: true,
  });
};
