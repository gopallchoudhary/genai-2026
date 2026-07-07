import { OpenAI } from "openai";
import 'dotenv/config';
const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

async function main() {
	const response = await client.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [{ role: "user", content: "Tell me what is 2 + 2" }],
	});

    console.log('Response from OpenAI: ' + response.data.choices[0].message.content);
}
