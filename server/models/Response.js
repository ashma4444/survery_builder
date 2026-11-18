const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
	{
		survey: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Survey",
			required: true,
		},
		answers: [
			{
				questionId: { type: String, required: true },
				value: mongoose.Schema.Types.Mixed,
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
