import express from 'express';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

// Tool to get the current time
export const getCurrentTime = tool({
	name: 'get_current_time',
	description: 'This tool returns the current time',
	parameters: z.object({}),
	async execute() {
		return new Date().toString();
	},
});

// Tool to get the current menu
export const getMenuTool = tool({
	name: 'get_menu',
	description: 'Fetches and returns the menu items',
	parameters: z.object({}),
	async execute() {
		return {
			Drinks: {
				Chai: 'INR 50',
				Coffee: 'INR 70',
			},
			Veg: {
				DalMakhni: 'INR 250',
				Panner: 'INR 400',
			},
		};
	},
});

// Cooking Agent
export const cookingAgent = new Agent({
	name: 'Cooking Agent',
	model: 'gpt-4o-mini',
	tools: [getCurrentTime, getMenuTool],
	instructions: `
		You are a helpful cooking assistant who is specialized in cooking food.
		You help the users with food options and recipes and help them cook food.
		If a question is out of the scope of cooking, politely tell the user to select another agent.
	`,
});

// Coding Agent
export const codingAgent = new Agent({
	name: 'Coding Agent',
	model: 'gpt-4o-mini',
	instructions: `
		You are an expert coding assistant, particularly in Javascript. If any questions come out of scope of javascript, politely tell the user to select another agent.
	`,
	tools: [
		cookingAgent.asTool({
			toolName: 'cooking_agent',
			toolDescription: 'Invoke the Cooking Agent to answer food/menu questions',
		}),
	],
});

// New Agent 1: Weather Assistant
export const weatherAgent = new Agent({
	name: 'Weather Assistant',
	model: 'gpt-4o-mini',
	instructions: `
		You are a helpful weather assistant. You provide accurate weather forecasts and current conditions based on the user's location.
		If a question is out of the scope of weather, politely tell the user to select another agent.
	`,
	tools: [
		tool({
			name: 'get_weather',
			description: 'Fetches weather for a given city.',
			parameters: z.object({
				city: z.string().describe('The name of the city.'),
			}),
			async execute({ city }) {
				// In a real application, you would call an external API here.
				return JSON.stringify({
					city,
					temperature: '22°C (72°F)',
					condition: 'Sunny with a light breeze',
					humidity: '45%',
				});
			}
		})
	],
});

// New Agent 2: Finance Assistant
export const financeAgent = new Agent({
	name: 'Finance Assistant',
	model: 'gpt-4o-mini',
	instructions: `
		You are a professional finance assistant. You can explain financial concepts, and provide stock market data.
		If a question is out of the scope of finance, politely tell the user to select another agent.
	`,
	tools: [
		tool({
			name: 'get_stock_price',
			description: 'Fetches the current price of a stock by its ticker symbol.',
			parameters: z.object({
				symbol: z.string().describe('The stock ticker symbol (e.g., AAPL).'),
			}),
			async execute({ symbol }) {
				// In a real application, you would call a financial data API.
				return JSON.stringify({
					symbol,
					price: '150.75',
					currency: 'USD',
					change: '+1.25',
				});
			}
		})
	],
});

// New Agent 3: Language Translator
export const translationAgent = new Agent({
	name: 'Language Translator',
	model: 'gpt-4o-mini',
	instructions: `
		You are a helpful language translator. You translate text from one language to another.
		If a question is out of the scope of translation, politely tell the user to select another agent.
	`,
	tools: [
		tool({
			name: 'translate_text',
			description: 'Translates a given text into a target language.',
			parameters: z.object({
				text: z.string().describe('The text to translate.'),
				targetLanguage: z.string().describe('The language to translate to.'),
			}),
			async execute({ text, targetLanguage }) {
				// In a real application, you would call a translation API.
				return `The translation of "${text}" into ${targetLanguage} is "Hello world".`;
			}
		})
	],
});


