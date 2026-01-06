const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const premiumController = require("../controllers/premiumController");

router.get("/showleaderboard", authenticate, premiumController.showLeaderboard);
router.get("/downloadedfiles", authenticate, premiumController.getDownloadedFiles);

module.exports = router;
