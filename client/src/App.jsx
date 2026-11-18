import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateSurvey from "./pages/CreateSurvey";
import EditSurvey from "./pages/EditSurvey";
import PublicSurvey from "./pages/PublicSurvey";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/surveys/create"
					element={
						<ProtectedRoute>
							<CreateSurvey />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/surveys/:id/edit"
					element={
						<ProtectedRoute>
							<EditSurvey />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/surveys/:id/analytics"
					element={
						<ProtectedRoute>
							<Analytics />
						</ProtectedRoute>
					}
				/>
				<Route path="/survey/:id" element={<PublicSurvey />} />
				<Route path="/" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
