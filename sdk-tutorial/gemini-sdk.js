import 'dotenv/config'
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.OPENROUTER_API_KEY });

async function main() {
	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: "Why is the sky blue?",
	});
	console.log(response.text);
}

main();
