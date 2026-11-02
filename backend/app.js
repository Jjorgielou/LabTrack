const express = require('express');
const cors = require('cors');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', maintenanceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});