const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const responseRoutes = require("./routes/responseRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/surveys", responseRoutes);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../client/dist")));

	app.get("{*path}", (req, res) => {
		res.sendFile(path.join(__dirname, "../client/dist/index.html"));
	});
} else {
	app.get("/", (req, res) => {
		res.json({ message: "Survey Builder API is running" });
	});
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
