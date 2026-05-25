const { CommunityPost, User } = require('../models');

const listPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.create({
      user_id: req.user.id,
      ...req.body,
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

module.exports = { listPosts, createPost };
