
const express = require("express");
require("dotenv").config();
require("./db");

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LabTrack!",
        status: "running"
    });
});

app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});
