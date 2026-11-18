const Survey = require("../models/Survey");

const createSurvey = async (req, res) => {
	try {
		const { title, description, questions } = req.body;

		if (!title) {
			return res.status(400).json({ message: "Title is required" });
		}

		const survey = await Survey.create({
			title,
			description: description || "",
			questions: questions || [],
			createdBy: req.user._id,
		});

		res.status(201).json(survey);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getSurveys = async (req, res) => {
	try {
		const surveys = await Survey.find({ createdBy: req.user._id }).sort({
			createdAt: -1,
		});

		res.json(surveys);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getSurveyById = async (req, res) => {
	try {
		const survey = await Survey.findById(req.params.id);

		if (!survey) {
			return res.status(404).json({ message: "Survey not found" });
		}

		res.json(survey);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const updateSurvey = async (req, res) => {
	try {
		const survey = await Survey.findOne({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!survey) {
			return res.status(404).json({ message: "Survey not found" });
		}

		const { title, description, questions } = req.body;

		if (title !== undefined) survey.title = title;
		if (description !== undefined) survey.description = description;
		if (questions !== undefined) survey.questions = questions;

		await survey.save();

		res.json(survey);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const deleteSurvey = async (req, res) => {
	try {
		const survey = await Survey.findOneAndDelete({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!survey) {
			return res.status(404).json({ message: "Survey not found" });
		}

		res.json({ message: "Survey deleted" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const publishSurvey = async (req, res) => {
	try {
		const survey = await Survey.findOne({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!survey) {
			return res.status(404).json({ message: "Survey not found" });
		}

		survey.isPublished = !survey.isPublished;
		await survey.save();

		res.json(survey);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getPublicSurvey = async (req, res) => {
	try {
		const survey = await Survey.findOne({
			_id: req.params.id,
			isPublished: true,
		}).select("-createdBy");

		if (!survey) {
			return res.status(404).json({ message: "Survey not found or not published" });
		}

		res.json(survey);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	createSurvey,
	getSurveys,
	getSurveyById,
	updateSurvey,
	deleteSurvey,
	publishSurvey,
	getPublicSurvey,
};
