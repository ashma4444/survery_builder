import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import QuestionRenderer from "../components/QuestionRenderer";

function shouldShowQuestion(question, answers) {
	if (!question.conditionalLogic?.enabled) return true;
	const { questionId, value } = question.conditionalLogic;
	if (!questionId || !value) return true;
	const answer = answers[questionId];
	return answer === value;
}

export default function PublicSurvey() {
	const { id } = useParams();
	const [survey, setSurvey] = useState(null);
	const [answers, setAnswers] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSurvey = async () => {
			try {
				const res = await api.get(`/surveys/public/${id}`);
				setSurvey(res.data);
			} catch (err) {
				setError("Survey not found or not available");
			} finally {
				setLoading(false);
			}
		};
		fetchSurvey();
	}, [id]);

	const handleChange = (questionId, value) => {
		setAnswers({ ...answers, [questionId]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		const visibleQuestions = survey.questions.filter((q) => shouldShowQuestion(q, answers));
		for (const q of visibleQuestions) {
			if (q.required) {
				const val = answers[q.id];
				if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
					setError(`Please answer: "${q.question}"`);
					return;
				}
			}
		}

		const payload = Object.entries(answers).map(([questionId, value]) => ({
			questionId,
			value,
		}));

		try {
			await api.post(`/surveys/${id}/responses`, { answers: payload });
			setSubmitted(true);
		} catch (err) {
			setError(err.response?.data?.message || "Submission failed");
		}
	};

	if (loading) return <div className="page-center">Loading...</div>;
	if (error && !survey) return <div className="page-center error-msg">{error}</div>;

	if (submitted) {
		return (
			<div className="page-center">
				<div className="success-card">
					<h2>Thank you!</h2>
					<p>Your response has been submitted.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="public-survey">
			<div className="survey-header">
				<h1>{survey.title}</h1>
				{survey.description && <p>{survey.description}</p>}
			</div>

			{error && <p className="error-msg">{error}</p>}

			<form onSubmit={handleSubmit}>
				{survey.questions.map((q) => {
					if (!shouldShowQuestion(q, answers)) return null;

					return (
						<div key={q.id} className="public-question">
							<label className="question-label">
								{q.question}
								{q.required && <span className="required-mark"> *</span>}
							</label>
							<QuestionRenderer
								question={q}
								value={answers[q.id]}
								onChange={(val) => handleChange(q.id, val)}
							/>
						</div>
					);
				})}

				<button type="submit" className="btn-primary submit-btn">
					Submit
				</button>
			</form>
		</div>
	);
}
