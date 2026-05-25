const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('CommunityPost', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    content: DataTypes.TEXT,
    category: { type: DataTypes.STRING(50), defaultValue: 'general' },
    likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    tableName: 'community_posts',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });
};
