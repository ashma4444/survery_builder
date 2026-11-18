const express = require("express");
const {
	createSurvey,
	getSurveys,
	getSurveyById,
	updateSurvey,
	deleteSurvey,
	publishSurvey,
	getPublicSurvey,
} = require("../controllers/surveyController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/public/:id", getPublicSurvey);

router.use(protect, adminOnly);

router.post("/", createSurvey);
router.get("/", getSurveys);
router.get("/:id", getSurveyById);
router.put("/:id", updateSurvey);
router.delete("/:id", deleteSurvey);
router.patch("/:id/publish", publishSurvey);

module.exports = router;
