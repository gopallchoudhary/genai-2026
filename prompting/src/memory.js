import { OpenAI } from "openai";
import "dotenv/config";
const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

async function main() {
	const result = await client.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [{ role: "user", content: "Can you tell my name?" }],
	});

	console.log("AI Response: ", result.choices[0].message.content);
}

main();
