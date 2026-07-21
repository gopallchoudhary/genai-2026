import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";
import 'dotenv/config'


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
			collectionName: "rag-docs",
		},
	);

    

	const vectorRetriever = vectorStore.asRetriever({ k: 5 });
	const results = await vectorRetriever.invoke(userQuery);

	const SYSTEM_PROMPT = `
        You are an expert in answereing user query based on the provided context  about document.
        Do not answere anything beyond what is not provided.

        Always also answer the user in short and tell on which page number that content is available and also   name of the book

        User Documents:
        ${results.map((e) => JSON.stringify({ bookName: e.metadata.source, pageContent: e.pageContent, pageNumber: e.metadata.loc.pageNumber })).join("\n\n")}
    `;

	const llmResponse = await client.chat.completions.create({
		model: "gpt-4.1-mini",
		messages: [
			{ role: "system", content: SYSTEM_PROMPT },
			{ role: "user", content: userQuery },
		],
	});

	console.log(`LLM Response: ${llmResponse.choices[0].message.content}`);
}

query("what is client server systems design and stats its testing issues.");
