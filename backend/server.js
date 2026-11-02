const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Serves the frontend folder, making frontend/js/app.js available at /js/app.js
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/maintenance', require('./routes/maintenance'));

app.listen(3000, () => console.log('Server running at http://localhost:3000'));