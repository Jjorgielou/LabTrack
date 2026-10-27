const express = require("express");
require("dotenv").config();

const db = require("./config/db");
const labRoutes = require("./routes/laboratories");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LabTrack!",
        status: "running"
    });
});
app.get("/api/health/db", async (req, res)=> {
    try{
        const[rows]= await db.query("Select 1 as connected");
        res.status(200).json({
            message: "Database connection success!",
            database: "connected",
            result: rows[0].connected
        });
    } catch (error) {
        console.error("Database connection failed :(",
            error.message
        );
        res.status(500).json({
            message: "Database connection failed:",
            database: "disconnected"
        });
    }
});

app.use("/api/laboratories", labRoutes);

app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});
