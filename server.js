const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;
require('dotenv').config();
const apiKey = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

app.use(bodyParser.json());

// Enable CORS if needed
const cors = require('cors');
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file for the chat interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(userMessage);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ response: 'Sorry, something went wrong.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
