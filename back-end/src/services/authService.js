const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, UserAnalytics } = require('../models');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async ({ email, password, name }) => {
  const existing = await User.scope('withPassword').findOne({ where: { email } });
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password_hash,
    name,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  });

  await UserAnalytics.create({ user_id: user.id });

  const token = generateToken(user);
  return { user: user.toSafeJSON(), token };
};

const login = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user: user.toSafeJSON(), token };
};

module.exports = { register, login, generateToken };
