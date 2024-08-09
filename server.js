const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const md = require('markdown-it')();

const app = express();
const port = 3000;

require('dotenv').config();
const apiKey = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'User message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(userMessage);

        if (!result || !result.response || typeof result.response.text !== 'function') {
            throw new Error('Invalid or empty response from API');
        }

        const responseText = result.response.text();
        console.log('API Response:', responseText); // Log the raw response
        const modifiedResponse = md.render(responseText); // Process the response as needed

        res.json({ response: modifiedResponse });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
