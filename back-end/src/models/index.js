const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, dbConfig)
  : new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const Compound = require('./Compound')(sequelize);
const Module = require('./Module')(sequelize);
const UserModule = require('./UserModule')(sequelize);
const Experiment = require('./Experiment')(sequelize);
const ExperimentCompound = require('./ExperimentCompound')(sequelize);
const Prediction = require('./Prediction')(sequelize);
const KineticSnapshot = require('./KineticSnapshot')(sequelize);
const AiRecommendation = require('./AiRecommendation')(sequelize);
const Notification = require('./Notification')(sequelize);
const UserAnalytics = require('./UserAnalytics')(sequelize);
const CommunityPost = require('./CommunityPost')(sequelize);

// Associations
User.hasMany(Experiment, { foreignKey: 'user_id', as: 'experiments' });
Experiment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Prediction, { foreignKey: 'user_id', as: 'predictions' });
Prediction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Prediction.belongsTo(Experiment, { foreignKey: 'experiment_id', as: 'experiment' });
Experiment.hasMany(Prediction, { foreignKey: 'experiment_id', as: 'predictions' });

Experiment.belongsToMany(Compound, {
  through: ExperimentCompound,
  foreignKey: 'experiment_id',
  otherKey: 'compound_id',
  as: 'compounds',
});
Compound.belongsToMany(Experiment, {
  through: ExperimentCompound,
  foreignKey: 'compound_id',
  otherKey: 'experiment_id',
  as: 'experiments',
});

Experiment.hasMany(KineticSnapshot, { foreignKey: 'experiment_id', as: 'kineticSnapshots' });
KineticSnapshot.belongsTo(Experiment, { foreignKey: 'experiment_id', as: 'experiment' });

User.belongsToMany(Module, {
  through: UserModule,
  foreignKey: 'user_id',
  otherKey: 'module_id',
  as: 'modules',
});
Module.belongsToMany(User, {
  through: UserModule,
  foreignKey: 'module_id',
  otherKey: 'user_id',
  as: 'users',
});

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(UserAnalytics, { foreignKey: 'user_id', as: 'analytics' });
UserAnalytics.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(CommunityPost, { foreignKey: 'user_id', as: 'posts' });
CommunityPost.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Compound,
  Module,
  UserModule,
  Experiment,
  ExperimentCompound,
  Prediction,
  KineticSnapshot,
  AiRecommendation,
  Notification,
  UserAnalytics,
  CommunityPost,
};
