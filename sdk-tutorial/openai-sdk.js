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
	const result = await client.responses.parse({
		model: "gpt-4o-mini",
		text: {
			format: zodTextFormat(outputSchema, "risks"),
		},
		input: `
            Extract the risks from the followind document

			Document:
			Our company recently launched a new software platform.
			The platform relies on several third-party APIs that may experience downtime.
			In addition we are storing customer data in the cloud, and there are strict
			regulatory requirements regarding data privacy and protection.
			Some features are still in beta and could potentially introduce bugs
			that affect user experience.

			Please list any risks you find the document above.
        `,
	});

	console.log(result.output_parsed.risks[0].tags);
}
init()