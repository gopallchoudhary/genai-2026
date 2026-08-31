import { OpenAI } from "openai";
import "dotenv/config";
const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

async function main() {
	const response = await client.chat.completions.create({
		model: "gpt-4o",
		messages: [{ role: "user", content: "Which is greater 9.11 or 9.8" }],
	});

	console.log(
		"Response from OpenAI: " + response.choices[0].message.content,
	);
}

main();
