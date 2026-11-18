import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function Analytics() {
	const { id } = useParams();
	const [data, setData] = useState(null);
	const [survey, setSurvey] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [analyticsRes, surveyRes] = await Promise.all([
					api.get(`/surveys/${id}/analytics`),
					api.get(`/surveys/${id}`),
				]);
				setData(analyticsRes.data);
				setSurvey(surveyRes.data);
			} catch (err) {
				setError("Failed to load analytics");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [id]);

	if (loading) return <div className="page-center">Loading...</div>;
	if (error) return <div className="page-center error-msg">{error}</div>;

	return (
		<div className="analytics-page">
			<div className="analytics-header">
				<Link to="/dashboard" className="back-link">
					← Back
				</Link>
				<h1>{survey.title} — Analytics</h1>
			</div>

			<div className="total-card">
				<span className="total-label">Total Responses</span>
				<span className="total-number">{data.totalResponses}</span>
			</div>

			{data.totalResponses === 0 ? (
				<p className="empty-msg">No responses yet.</p>
			) : (
				<div className="analytics-questions">
					{data.questions.map((q) => (
						<div key={q.questionId} className="analytics-card">
							<h3>{q.question}</h3>
							<p className="q-type">{q.type} — {q.totalAnswers} answers</p>

							{(q.type === "multiple-choice" || q.type === "checkbox") && q.optionCounts && (
								<div className="bar-chart">
									{Object.entries(q.optionCounts).map(([opt, count]) => {
										const pct = q.totalAnswers > 0 ? Math.round((count / q.totalAnswers) * 100) : 0;
										return (
											<div key={opt} className="bar-row">
												<span className="bar-label">{opt}</span>
												<div className="bar-track">
													<div className="bar-fill" style={{ width: `${pct}%` }} />
												</div>
												<span className="bar-count">
													{count} ({pct}%)
												</span>
											</div>
										);
									})}
								</div>
							)}

							{q.type === "rating" && (
								<div className="rating-avg">
									<span className="avg-star">★</span>
									<span className="avg-number">{q.average}</span>
									<span className="avg-of">/ 5</span>
								</div>
							)}

							{q.type === "text" && q.textResponses && (
								<ul className="text-responses">
									{q.textResponses.map((t, i) => (
										<li key={i}>"{t}"</li>
									))}
								</ul>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
