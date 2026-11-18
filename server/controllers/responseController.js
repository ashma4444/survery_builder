const SurveyResponse = require("../models/Response");
const Survey = require("../models/Survey");

const submitResponse = async (req, res) => {
	try {
		const survey = await Survey.findOne({
			_id: req.params.id,
			isPublished: true,
		});

		if (!survey) {
			return res.status(404).json({ message: "Survey not found or not published" });
		}

		const { answers } = req.body;

		if (!answers || !Array.isArray(answers)) {
			return res.status(400).json({ message: "Answers are required" });
		}

		const response = await SurveyResponse.create({
			survey: survey._id,
			answers,
		});

		res.status(201).json({ message: "Response submitted", id: response._id });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getResponses = async (req, res) => {
	try {
		const survey = await Survey.findOne({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!survey) {
			return res.status(404).json({ message: "Survey not found" });
		}

		const responses = await SurveyResponse.find({ survey: survey._id }).sort({
			createdAt: -1,
		});

		res.json(responses);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getAnalytics = async (req, res) => {
	try {
		const survey = await Survey.findOne({
			_id: req.params.id,
			createdBy: req.user._id,
		});

		if (!survey) {
			return res.status(404).json({ message: "Survey not found" });
		}

		const responses = await SurveyResponse.find({ survey: survey._id });

		const totalResponses = responses.length;
		const questionAnalytics = survey.questions.map((q) => {
			const questionAnswers = responses
				.map((r) => {
					const ans = r.answers.find((a) => a.questionId === q.id);
					return ans ? ans.value : null;
				})
				.filter((v) => v !== null);

			const analytics = {
				questionId: q.id,
				question: q.question,
				type: q.type,
				totalAnswers: questionAnswers.length,
			};

			if (q.type === "multiple-choice") {
				const counts = {};
				for (const opt of q.options) {
					counts[opt] = 0;
				}
				for (const val of questionAnswers) {
					if (counts[val] !== undefined) {
						counts[val]++;
					}
				}
				analytics.optionCounts = counts;
			}

			if (q.type === "checkbox") {
				const counts = {};
				for (const opt of q.options) {
					counts[opt] = 0;
				}
				for (const val of questionAnswers) {
					if (Array.isArray(val)) {
						for (const v of val) {
							if (counts[v] !== undefined) {
								counts[v]++;
							}
						}
					}
				}
				analytics.optionCounts = counts;
			}

			if (q.type === "rating") {
				const nums = questionAnswers.map(Number).filter((n) => !isNaN(n));
				const sum = nums.reduce((a, b) => a + b, 0);
				analytics.average = nums.length > 0 ? Math.round((sum / nums.length) * 10) / 10 : 0;
			}

			if (q.type === "text") {
				analytics.textResponses = questionAnswers.slice(0, 50);
			}

			return analytics;
		});

		res.json({ totalResponses, questions: questionAnalytics });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = { submitResponse, getResponses, getAnalytics };
