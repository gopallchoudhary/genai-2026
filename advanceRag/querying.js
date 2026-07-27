import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";
import "dotenv/config";

const client = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: process.env.OPENROUTER_BASE_URL,
});

async function query(userQuery) {
	// embeddings
	const embeddings = new OpenAIEmbeddings({
		model: "text-embedding-3-small",
		apiKey: process.env.OPENROUTER_API_KEY,
		configuration: {
			baseURL: process.env.OPENROUTER_BASE_URL,
		},
	});

	// vector store
	const vectorStore = await QdrantVectorStore.fromExistingCollection(
		embeddings,
		{
			url: "http://localhost:6333",
			collectionName: "expo-docs",
		},
	);

	const vectorRetriever = vectorStore.asRetriever({ k: 5 });
	const results = await vectorRetriever.invoke(userQuery);

	const SYSTEM_PROMPT = `You are a course assistant for a React Native / Expo mobile development course.

You answer student questions using ONLY the transcript excerpts provided below. Each excerpt is 
labeled with its module, lesson name, and timestamp — you MUST cite these in every answer.

You must respond with ONLY a valid JSON object — no markdown fences, no preamble, no explanation 
outside the JSON. The JSON must match this exact shape:

{
  "answer": "string — your full answer in plain prose, written normally for a student to read",
  "citations": [
    {
      "module": "string — exact module name from the excerpt label",
      "lecture": "string — exact lecture name from the excerpt label",
      "timestamp": "string — exact timestamp from the excerpt label, e.g. '28:19'",
      "note": "string — one short phrase on what this citation supports"
    }
  ],
  "foundAnswer": true or false
}

Rules:
- Answer using only the information in the provided excerpts. Do not use outside knowledge.
- For every claim you make, cite the module, lesson name, and timestamp it came from, 
  e.g. "(Module 12 — Push Notification, 38:47)".
- If multiple excerpts support the answer, cite each one you actually used.
- If the excerpts don't contain the answer, say so plainly — do not guess or make something up.
- Keep answers concise and directly focused on what the student asked.
- If relevant, tell the student which lesson to rewatch and at what timestamp to find more detail.
- If information comes from more than one lesson, group your answer by lesson 
  (e.g., a short heading per lesson) rather than interleaving facts from different 
  lessons within the same numbered list.`;

	const sortedDocs = [...results].sort(
		(a, b) => a.metadata.startTime - b.metadata.startTime,
	);

	const context = sortedDocs
		.map(
			(doc) =>
				`[${doc.metadata.module} — ${doc.metadata.lecture} @ ${doc.metadata.startTimestamp}]\n${doc.pageContent}`,
		)
		.join("\n\n---\n\n");

	console.log(`Context: ${context}`);

	const llmResponse = await client.chat.completions.create({
		model: "gpt-4.1-mini",
        response_format: {type: 'json_object'},
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{
				role: "user",
				content: `Course excerpts:\n${context}\n\nQuestion: ${userQuery}`,
			},
		],
	});

	console.log(`LLM Response: ${llmResponse.choices[0].message.content}`);
}

query("How do I set up push notifications?");
