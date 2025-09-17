const CardConfig = require('../models/CardConfig');
const CardConfigSettings = require('../models/CardConfigSettings');
const { runAutoCardConfigUpdate } = require("../utils/updateCardsConfig");

getCardsConfig = async (req, res) => {
  try {
    const cards = await CardConfig.find().sort({ createdAt: 1 });
    res.json({ cards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const seeLastUpdate = async (req, res) => {
  const settings = await CardConfigSettings.findOne();
  if (!settings) return res.json({ lastUpdatedAt: null, lastUpdatedBy: null });

  res.json({
    lastUpdatedAt: settings.lastUpdatedAt,
    lastUpdatedBy: settings.lastUpdatedBy,
  });
}


deleteCardConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await CardConfig.findByIdAndDelete(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ message: 'Card deleted', data: card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLastUpdateMeta = async (req, res) => {
  const latest = await CardConfigSettings.findOne();
  if (!latest) return res.json({});
  res.json({
    lastUpdatedAt: latest.lastUpdatedAt,
    lastUpdatedBy: latest.lastUpdatedBy
  });
};

const getAutoSetting = async (req, res) => {
  const setting = await CardConfigSettings.findOne();
  res.json({ useAuto: setting?.useAuto ?? false });
};

const updateAutoSetting = async (req, res) => {
  const { useAuto } = req.body;

  const updated = await CardConfigSettings.findOneAndUpdate(
    {},
    { useAuto },
    { new: true, upsert: true }
  );

  res.json({ useAuto: updated.useAuto });
};

const forceAutoRefresh = async (req, res) => {
  try {
    await runAutoCardConfigUpdate(); // updated logic already logs by 'auto'
    res.json({ message: "✅ Auto card config updated immediately." });
  } catch (err) {
    console.error("❌ Error in forceAutoRefresh:", err.message);
    res.status(500).json({ error: "Failed to update card config automatically." });
  }
};

// DEPRECATED — can be removed if unused
const createAutoSetting = async (req, res) => {
  try {
    // 🔁 This is now redundant — replaced by runAutoCardConfigUpdate
    await runAutoCardConfigUpdate();
    res.json({ message: "✅ Manual auto update executed." });
  } catch (err) {
    console.error("❌ Manual auto update failed:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCardsConfig,
  deleteCardConfig,
  seeLastUpdate,
  getAutoSetting,
  updateAutoSetting,
  forceAutoRefresh,
  getLastUpdateMeta,
  createAutoSetting
};
