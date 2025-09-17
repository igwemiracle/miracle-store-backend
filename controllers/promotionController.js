const PromotionalSection = require('../models/PromotionalSection');


const createPromotion = async (req, res) => {
  try {
    const promo = new PromotionalSection(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const getAllPromotions = async (req, res) => {
  try {
    const promos = await PromotionalSection.find()
      .populate('category');
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const promo = await PromotionalSection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePromotion = async (req, res) => {
  try {
    await PromotionalSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPromotionById = async (req, res) => {
  try {
    const promo = await PromotionalSection.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createPromotion,
  getAllPromotions,
  updatePromotion,
  deletePromotion,
  getPromotionById
};
