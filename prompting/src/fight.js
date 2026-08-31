import { OpenAI } from "openai";
import "dotenv/config";

function openAIClient(systemPrompt) {
	const messages = [{ role: "system", content: systemPrompt }];
	const client = new OpenAI({
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: process.env.OPENROUTER_BASE_URL,
	});

	return async function (message, model = "gpt-4o-mini") {
		messages.push({ role: "user", content: message });
		const response = await client.chat.completions.create({
			model,
			messages,
		});

		const assistantResponse = response.choices[0].message.content;
		messages.push({ role: "assistant", content: assistantResponse });
	};
}

function deepseekClient(systemPrompt) {
	const messages = [{ role: "system", content: systemPrompt }];
	const client = new OpenAI({
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: process.env.OPENROUTER_BASE_URL,
	});

	return async function (message, model = "deepseek-chat") {
		messages.push({ role: "user", content: message });
		const response = await client.chat.completions.create({
			model,
			messages,
		});

		const assistantResponse = response.choices[0].message.content;
		messages.push({ role: "assistant", content: assistantResponse });
	};
}

let lastMessage = "hello";
const MAX_TURN = 12
let CURRENT_TRN

