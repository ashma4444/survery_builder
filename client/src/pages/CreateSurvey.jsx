import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TYPES = ["text", "multiple-choice", "checkbox", "rating"];

function generateId() {
	return "q_" + Math.random().toString(36).slice(2, 9);
}

export default function CreateSurvey() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [questions, setQuestions] = useState([]);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const addQuestion = () => {
		setQuestions([
			...questions,
			{
				id: generateId(),
				type: "text",
				question: "",
				required: false,
				options: [],
				conditionalLogic: { enabled: false, questionId: null, operator: "equals", value: null },
			},
		]);
	};

	const updateQuestion = (index, updates) => {
		setQuestions((prev) =>
			prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
		);
	};

	const updateConditional = (index, field, value) => {
		const updated = questions.map((q, i) =>
			i === index ? { ...q, conditionalLogic: { ...q.conditionalLogic, [field]: value } } : q
		);
		setQuestions(updated);
	};

	const removeQuestion = (index) => {
		setQuestions(questions.filter((_, i) => i !== index));
	};

	const moveQuestion = (index, direction) => {
		const target = index + direction;
		if (target < 0 || target >= questions.length) return;
		const updated = [...questions];
		[updated[index], updated[target]] = [updated[target], updated[index]];
		setQuestions(updated);
	};

	const addOption = (index) => {
		const updated = questions.map((q, i) =>
			i === index ? { ...q, options: [...q.options, ""] } : q
		);
		setQuestions(updated);
	};

	const updateOption = (qIndex, oIndex, value) => {
		const updated = questions.map((q, i) => {
			if (i !== qIndex) return q;
			const opts = q.options.map((o, j) => (j === oIndex ? value : o));
			return { ...q, options: opts };
		});
		setQuestions(updated);
	};

	const removeOption = (qIndex, oIndex) => {
		const updated = questions.map((q, i) => {
			if (i !== qIndex) return q;
			return { ...q, options: q.options.filter((_, j) => j !== oIndex) };
		});
		setQuestions(updated);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		try {
			await api.post("/surveys", { title, description, questions });
			navigate("/dashboard");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to create survey");
		}
	};

	const previousQuestions = (currentIndex) =>
		questions.filter((_, i) => i < currentIndex);

	return (
		<div className="survey-editor">
			<h1>Create Survey</h1>
			{error && <p className="error-msg">{error}</p>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Survey title"
						required
					/>
				</div>

				<div className="form-group">
					<label>Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Survey description (optional)"
						rows={3}
					/>
				</div>

				<h2>Questions</h2>

				{questions.map((q, index) => (
					<div key={q.id} className="question-block">
						<div className="question-header">
							<span className="q-number">Q{index + 1}</span>
							<div className="question-actions">
								<button type="button" onClick={() => moveQuestion(index, -1)} disabled={index === 0}>
									↑
								</button>
								<button
									type="button"
									onClick={() => moveQuestion(index, 1)}
									disabled={index === questions.length - 1}
								>
									↓
								</button>
								<button type="button" onClick={() => removeQuestion(index)} className="btn-danger">
									✕
								</button>
							</div>
						</div>

						<div className="form-group">
							<label>Question text</label>
							<input
								type="text"
								value={q.question}
								onChange={(e) => updateQuestion(index, { question: e.target.value })}
								placeholder="Enter your question"
								required
							/>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label>Type</label>
								<select
									value={q.type}
									onChange={(e) => {
										const newType = e.target.value;
										const updates = { type: newType };
										if (newType === "text" || newType === "rating") {
											updates.options = [];
										}
										updateQuestion(index, updates);
									}}
								>
									{TYPES.map((t) => (
										<option key={t} value={t}>
											{t}
										</option>
									))}
								</select>
							</div>

							<label className="checkbox-label">
								<input
									type="checkbox"
									checked={q.required}
									onChange={(e) => updateQuestion(index, { required: e.target.checked })}
								/>
								Required
							</label>
						</div>

						{(q.type === "multiple-choice" || q.type === "checkbox") && (
							<div className="options-editor">
								<label>Options</label>
								{q.options.map((opt, oIndex) => (
									<div key={oIndex} className="option-row">
										<input
											type="text"
											value={opt}
											onChange={(e) => updateOption(index, oIndex, e.target.value)}
											placeholder={`Option ${oIndex + 1}`}
										/>
										<button type="button" onClick={() => removeOption(index, oIndex)} className="btn-danger btn-small">
											✕
										</button>
									</div>
								))}
								<button type="button" onClick={() => addOption(index)} className="btn-small">
									+ Add Option
								</button>
							</div>
						)}

						{index > 0 && (
							<div className="conditional-section">
								<label className="checkbox-label">
									<input
										type="checkbox"
										checked={q.conditionalLogic.enabled}
										onChange={(e) => updateConditional(index, "enabled", e.target.checked)}
									/>
									Conditional Logic
								</label>

								{q.conditionalLogic.enabled && (
									<div className="conditional-fields">
										<select
											value={q.conditionalLogic.questionId || ""}
											onChange={(e) => updateConditional(index, "questionId", e.target.value)}
										>
											<option value="">Select question...</option>
											{previousQuestions(index).map((pq) => (
												<option key={pq.id} value={pq.id}>
													{pq.question || `Q (${pq.id})`}
												</option>
											))}
										</select>
										<span>equals</span>
										<input
											type="text"
											value={q.conditionalLogic.value || ""}
											onChange={(e) => updateConditional(index, "value", e.target.value)}
											placeholder="Value"
										/>
									</div>
								)}
							</div>
						)}
					</div>
				))}

				<button type="button" onClick={addQuestion} className="btn-secondary add-q-btn">
					+ Add Question
				</button>

				<div className="form-actions">
					<button type="submit" className="btn-primary">
						Save Survey
					</button>
					<button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
