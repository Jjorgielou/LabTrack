const express = require('express');
const cors = require('cors');
require('dotenv').config();

const maintenanceRoutes = require('./routes/maintenance');

const app = express();
app.use(cors());
app.use(express.json());

// Mount the routes
app.use('/api/maintenance', maintenanceRoutes);
console.log('✓ Mounted /api/maintenance route successfully');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});