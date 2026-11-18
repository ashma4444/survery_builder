const express = require("express");
const { submitResponse, getResponses, getAnalytics } = require("../controllers/responseController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:id/responses", submitResponse);

router.get("/:id/responses", protect, adminOnly, getResponses);
router.get("/:id/analytics", protect, adminOnly, getAnalytics);

module.exports = router;
