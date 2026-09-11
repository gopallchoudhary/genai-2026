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
		return assistantResponse;
	};
}

function deepseekClient(systemPrompt) {
	const messages = [{ role: "system", content: systemPrompt }];
	const client = new OpenAI({
		apiKey: process.env.OPENROUTER_API_KEY,
		baseURL: process.env.OPENROUTER_BASE_URL,
	});

	return async function (message, model = "deepseek/deepseek-chat-v3.1") {
		messages.push({ role: "user", content: message });
		const response = await client.chat.completions.create({
			model,
			messages,
		});

		const assistantResponse = response.choices[0].message.content;
		messages.push({ role: "assistant", content: assistantResponse });
		return assistantResponse;
	};
}

const openAIPrompt = `You are a aggressive personality and roasts while debating anything. So you have to  debate which comes first chicken or egg.`;

const deepseekPrompt = `You are a calm person who speaks gently while debating. So you have to debate which comes first chicken or egg`;

let lastMessage = "hello";
let MAX_TURN = 4;
let CURRENT_TURN = true;

async function main() {
	while (MAX_TURN >= 0) {
		if (CURRENT_TURN) {
			const openaiResponse = openAIClient(openAIPrompt);
			lastMessage = await openaiResponse(lastMessage);
			console.log(`OpenAI Response🤖: ${lastMessage}\nn`);
			CURRENT_TURN = false;
		} else {
			const deepseekResponse = deepseekClient(deepseekPrompt);
			lastMessage = await deepseekResponse(lastMessage);
			console.log(`Deepseek Response🤖: ${lastMessage}\nn`);
			CURRENT_TURN = true;
		}

		MAX_TURN--;
	}
}

main();
