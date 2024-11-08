
const express = require('express');
const path = require('path');
const { groq } = require('@ai-sdk/groq');
const { streamText } = require('ai');  // Assuming you have a function to handle your AI generation

const dotenv = require ('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
// Middleware to parse JSON request bodies
app.use(express.json());

// Store conversation history
const messages = [];

// API endpoint to interact with the assistant
app.post('/chat', async (req, res) => {
  const userInput = req.body.message;

  if (!userInput) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Push user message to conversation history
  messages.push({ role: 'user', content: userInput });

  try {
    // Call the Groq API to stream the response
    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      messages,
    });

    let fullResponse = '';
    // Collect the response in real-time
    for await (const delta of result.textStream) {
      fullResponse += delta;
    }

    // Push assistant response to conversation history
    messages.push({ role: 'assistant', content: fullResponse });

    // Send back the full response as the API response
    res.json({ response: fullResponse });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the message' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
