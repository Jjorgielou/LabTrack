const express = require("express");
require("dotenv").config();
const session = require("express-session");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use (session({ 
    secret: process.env.SESSION_SECRET || "labtrack_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false }
}));

const conflictsRoutes = require("./routes/conflictRoutes");

app.use("/api/conflicts", conflictsRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LabTrack!",
        status: "running"
    });
});

app.listen(PORT, () => {
    console.log('LabTrack server is running at http://localhost:${PORT}');
});