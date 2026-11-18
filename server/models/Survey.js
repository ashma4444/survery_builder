const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ["text", "multiple-choice", "checkbox", "rating"],
			required: true,
		},
		question: {
			type: String,
			required: true,
		},
		required: {
			type: Boolean,
			default: false,
		},
		options: {
			type: [String],
			default: [],
		},
		conditionalLogic: {
			enabled: { type: Boolean, default: false },
			questionId: { type: String, default: null },
			operator: { type: String, enum: ["equals"], default: "equals" },
			value: { type: String, default: null },
		},
	},
	{ _id: false }
);

const surveySchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		questions: {
			type: [questionSchema],
			default: [],
		},
		isPublished: {
			type: Boolean,
			default: false,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Survey", surveySchema);
