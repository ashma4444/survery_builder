import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const res = await api.post("/auth/register", { name, email, password });
			localStorage.setItem("token", res.data.token);
			localStorage.setItem("user", JSON.stringify(res.data.user));
			navigate("/dashboard");
		} catch (err) {
			setError(err.response?.data?.message || "Registration failed");
		}
	};

	return (
		<div className="auth-page">
			<form className="auth-form" onSubmit={handleSubmit}>
				<h1>Register</h1>
				{error && <p className="error-msg">{error}</p>}
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<input
					type="password"
					placeholder="Password (min 6 characters)"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
				/>
				<button type="submit">Register</button>
				<p>
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</div>
	);
}
