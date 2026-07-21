import { OpenAI } from "openai";
import "dotenv/config";

const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

export async function hyde(userQuery) {
	const hydePrompt = `You are generating a hypothetical passage to help retrieve relevant documents.

Given the user's query, write a short passage that could plausibly appear in a document answering it. 
Write as if you are confidently stating facts — do NOT hedge, add disclaimers, say "I don't know", 
or mention that this is hypothetical. It is fine if the content is inaccurate; the goal is to match 
the style, vocabulary, and structure of real documents on this topic, not to be correct.

Rules:
- Write 3-5 sentences of plain prose (no bullet points, no headers, no preamble).
- Match the tone/domain of a [your corpus type, e.g. "technical documentation" / "medical literature" / "legal contract"].
- Do not repeat the query verbatim; answer it directly as a document would.
- Do not include phrases like "According to the query" or "The answer is".
`;

	const response = await client.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{
				role: "system",
				content: hydePrompt,
			},
			{
				role: "user",
				content: userQuery,
			},
		],
	});

	return response.choices[0].message.content;
}
