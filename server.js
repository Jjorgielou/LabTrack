const express = require('express');
const cors = require('cors');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/maintenance', maintenanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));