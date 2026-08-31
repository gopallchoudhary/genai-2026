import "dotenv/config";
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const RiskSchema = z.object({
	title: z.string().describe("Title of the document"),
	tags: z.array(z.string()).describe("Tags of the document"),
	score: z.number().describe("Score of the document"),
});

const outputSchema = z.object({
	risks: z.array(RiskSchema).describe("Risks of the document"),
});

const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

async function init() {
	const stream = await client.responses.create({
		model: "openrouter/free",
		input: [
			{
				role: "user",
				content: "What is hoisting in javascript? explain with example.",
			},
		],
		stream: true,
	});

	for await (const event of stream) {
		if (event && event.delta) process.stdout.write(event.delta);
	}
}

init();
