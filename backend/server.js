const express = require('express');
const bodyParser = require('body-parser');
const assignmentRoutes = require('./assignment');
const basicRoutes = require('./basic');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/assignments', assignmentRoutes);
app.use('/basic', basicRoutes);

// Serve static files
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});