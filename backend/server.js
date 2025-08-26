
// Import necessary modules
import express from 'express';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import cors from 'cors';
import dotenv from 'dotenv';
import { getCurrentTime, getMenuTool, cookingAgent, codingAgent, weatherAgent, financeAgent, translationAgent } from './tools/tools.js'

dotenv.config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001; // Use port 3001 or a port defined in .env

// Middleware
app.use(cors()); // Allows requests from your frontend application
app.use(express.json()); // Enables JSON body parsing for incoming requests

// Check for the OpenAI API key
const openAiApiKey = process.env.OPENAI_API_KEY;
if (!openAiApiKey) {
	console.error('Error: OPENAI_API_KEY environment variable is not set.');
	// Exit the process if the key is not found
	process.exit(1);
}

// ----------------------------------------------------
// API Endpoint

app.post('/api/chat', async (req, res) => {
	try {
		// Destructure both the query and the selectedAgent from the request body
		const { query, selectedAgent } = req.body;
		if (!query) {
			return res.status(400).json({ error: 'Query is required in the request body.' });
		}

		let result;
		console.log(`Received query for agent: ${selectedAgent}`);

		// Use a switch statement to run the correct agent based on the frontend selection
		switch (selectedAgent) {
			case 'Cooking Assistant':
				result = await run(cookingAgent, query);
				break;
			case 'Coding Assistant':
				result = await run(codingAgent, query);
				break;
			case 'Weather Assistant':
				result = await run(weatherAgent, query);
				break;
			case 'Finance Assistant':
				result = await run(financeAgent, query);
				break;
			case 'Language Translator':
				result = await run(translationAgent, query);
				break;
			default:
				// Handle the case where no valid agent is selected
				return res.status(400).json({ error: 'Invalid agent selected.' });
		}

		// Send the final output back to the client
		res.json({ finalOutput: result.finalOutput });
	} catch (error) {
		console.error('An error occurred during the agent run:', error);
		res.status(500).json({ error: 'An internal server error occurred while processing your request.' });
	}
});

// Start the server
app.listen(port, () => {
	console.log(`OpenAI Agents backend listening at http://localhost:${port}`);
});
