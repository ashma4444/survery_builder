import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const res = await api.post("/auth/login", { email, password });
			localStorage.setItem("token", res.data.token);
			localStorage.setItem("user", JSON.stringify(res.data.user));
			navigate("/dashboard");
		} catch (err) {
			setError(err.response?.data?.message || "Login failed");
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h1>Login</h1>
				{error && <p className="error-msg">{error}</p>}
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button type="submit">Login</button>
				<p>
					Don't have an account? <Link to="/register">Register</Link>
				</p>
			</form>
		</div>
	);
}
