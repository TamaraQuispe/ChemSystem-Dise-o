const { Op } = require('sequelize');
const { Compound } = require('../models');

const listCompounds = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = { is_active: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { label: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const compounds = await Compound.findAll({ where, order: [['name', 'ASC']] });
    res.json({ success: true, data: compounds });
  } catch (err) {
    next(err);
  }
};

const getCompound = async (req, res, next) => {
  try {
    const compound = await Compound.findByPk(req.params.id);
    if (!compound) return res.status(404).json({ success: false, message: 'Compuesto no encontrado' });
    res.json({ success: true, data: compound });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCompounds, getCompound };
