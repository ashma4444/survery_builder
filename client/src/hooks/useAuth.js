import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function useAuth() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		const stored = localStorage.getItem("user");
		if (token && stored) {
			setUser(JSON.parse(stored));
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		const res = await api.post("/auth/login", { email, password });
		localStorage.setItem("token", res.data.token);
		localStorage.setItem("user", JSON.stringify(res.data.user));
		setUser(res.data.user);
		return res.data;
	};

	const register = async (name, email, password) => {
		const res = await api.post("/auth/register", { name, email, password });
		localStorage.setItem("token", res.data.token);
		localStorage.setItem("user", JSON.stringify(res.data.user));
		setUser(res.data.user);
		return res.data;
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		navigate("/login");
	};

	return { user, loading, login, register, logout };
}
