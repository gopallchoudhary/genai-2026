import { OpenAI } from "openai";
import "dotenv/config";
const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

const SYSTEM_PROMPT = `
    You are an 
`;

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

async function main(prompt = "") {
	messages.push({ role: "user", content: prompt });

	while (true) {
		const response = await client.chat.completions.create({
			model: "gpt-4o-mini",
			messages: messages,
		});

		console.log(
			"Response from OpenAI: " + response.data.choices[0].message.content,
		);
	}
}
