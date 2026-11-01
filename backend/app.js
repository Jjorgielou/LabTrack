const express = require("express");
require("dotenv").config();
const cors = require('cors');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

const labRoutes = require('./routes/laboratories');
const PORT = process.env.PORT || 3000;

app.use('/api/laboratories', labRoutes);

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to LabTrack!", status: "running" });
});

app.get("/api/health/db", async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ success: true, data: { database: "connected" } });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
});


app.use((req, res) => {
    res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});
