
const express = require("express");
require("dotenv").config();
const cors = require('cors');
const pool = require('./config/db');

const app = express();
app.use(cors());
const labRoutes = require('./routes/laboratories');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/laboratories', labRoutes);


app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LabTrack!",
        status: "running"
    });
});

app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});
