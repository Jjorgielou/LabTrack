const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const maintenanceRoutes = require('./routes/maintenanceroutes');
app.use('/api/maintenance', maintenanceRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});