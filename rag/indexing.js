import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";


async function generateVectorEmbeddingsForFile(filepath) {
	const loader = new PDFLoader(filepath);
	const documents = await loader.load(); // already chunks document page by page

	// Initialize the embeddings
	const embeddings = new OpenAIEmbeddings({
		model: "text-embedding-3-small",
		apiKey: process.env.OPENROUTER_API_KEY,
		configuration: {
			baseURL: process.env.OPENROUTER_BASE_URL,
		},
	});

	// The vector store
	const vectorStore = await QdrantVectorStore.fromExistingCollection(
		embeddings,
		{
			url: "http://localhost:6333",
			collectionName: "rag-docs",
		},
	);

	await vectorStore.addDocuments(documents);
	console.log("All documents all indexed...");
}

generateVectorEmbeddingsForFile("./software.pdf");
