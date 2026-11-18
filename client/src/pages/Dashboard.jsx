import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
	const [surveys, setSurveys] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem("user") || "{}");

	useEffect(() => {
		fetchSurveys();
	}, []);

	const fetchSurveys = async () => {
		try {
			const res = await api.get("/surveys");
			setSurveys(res.data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this survey?")) return;
		try {
			await api.delete(`/surveys/${id}`);
			setSurveys((prev) => prev.filter((s) => s._id !== id));
		} catch (err) {
			alert(err.response?.data?.message || "Delete failed");
		}
	};

	const handlePublish = async (id) => {
		try {
			const res = await api.patch(`/surveys/${id}/publish`);
			setSurveys((prev) => prev.map((s) => (s._id === id ? res.data : s)));
		} catch (err) {
			alert(err.response?.data?.message || "Publish failed");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login");
	};

	if (loading) return <div className="page-center">Loading...</div>;

	return (
		<div className="dashboard">
			<header className="dash-header">
				<h1>Dashboard</h1>
				<div className="dash-header-right">
					<span>Hi, {user.name}</span>
					<button onClick={handleLogout} className="btn-secondary">
						Logout
					</button>
				</div>
			</header>

			<div className="dash-actions">
				<Link to="/surveys/create" className="btn-primary">
					+ Create Survey
				</Link>
			</div>

			{surveys.length === 0 ? (
				<p className="empty-msg">No surveys yet. Create your first one!</p>
			) : (
				<div className="survey-grid">
					{surveys.map((s) => (
						<div key={s._id} className="survey-card">
							<h3>{s.title}</h3>
							<p className="survey-desc">{s.description || "No description"}</p>
							<p className="survey-meta">
								{s.questions.length} questions &middot;{" "}
								<span className={s.isPublished ? "published" : "draft"}>
									{s.isPublished ? "Published" : "Draft"}
								</span>
							</p>
							<div className="card-actions">
								<Link to={`/surveys/${s._id}/edit`} className="btn-small">
									Edit
								</Link>
								<button onClick={() => handlePublish(s._id)} className="btn-small">
									{s.isPublished ? "Unpublish" : "Publish"}
								</button>
								{s.isPublished && (
									<Link to={`/surveys/${s._id}/analytics`} className="btn-small">
										Analytics
									</Link>
								)}
								<button onClick={() => handleDelete(s._id)} className="btn-small btn-danger">
									Delete
								</button>
								{s.isPublished && (
									<button
										className="btn-small"
										onClick={() => {
											navigator.clipboard.writeText(
												`${window.location.origin}/survey/${s._id}`
											);
											alert("Link copied!");
										}}
									>
										Copy Link
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
