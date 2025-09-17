const express = require('express');
const router = express.Router();

const { authenticateUser, authorizePermissions } = require('../middleware/authentication');
const {
  deleteCardConfig,
  getCardsConfig,
  seeLastUpdate,
  forceAutoRefresh,
  getLastUpdateMeta,
  updateAutoSetting,
  getAutoSetting,
} = require('../controllers/CardsConfigController');



// router.post('/refresh', manualRefreshCards);
router.get('/', getCardsConfig);
router.get('/last-update', [authenticateUser, authorizePermissions('admin')], seeLastUpdate)


// Delete a card
router.delete('/:id', [authenticateUser, authorizePermissions('admin')], deleteCardConfig);


// 🟢 GET current auto-setting status
router.get("/auto-setting", [authenticateUser, authorizePermissions('admin')], getAutoSetting);

// 🟢 PUT to toggle auto-refresh
router.put("/auto-setting", [authenticateUser, authorizePermissions('admin')], updateAutoSetting);

router.post("/force-auto-update", [authenticateUser, authorizePermissions('admin')], forceAutoRefresh);

// (Optional) GET last update meta
router.get("/last-update", [authenticateUser, authorizePermissions('admin')], getLastUpdateMeta);


module.exports = router;
