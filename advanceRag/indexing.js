import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";
import { getLectureFiles } from "./lectureFiles.js";
import { subtitleFileToDocuments } from "./utils.js";

async function indexCourse(courseDir) {
	const embeddings = new OpenAIEmbeddings({
		model: "text-embedding-3-small",
		apiKey: process.env.OPENROUTER_API_KEY,
		configuration: { baseURL: process.env.OPENROUTER_BASE_URL },
	});

	const vectorStore = await QdrantVectorStore.fromExistingCollection(
		embeddings,
		{
			url: "http://localhost:6333",
			collectionName: "expo-docs",
		},
	);

	const lectures = getLectureFiles(courseDir);
	console.log(`Found ${lectures.length} lectures`);

	for (const { filepath, module, lecture, lectureOrder, type } of lectures) {
		const docs = subtitleFileToDocuments(filepath, { module, lecture, lectureOrder, type });    

		if (docs.length) {
			await vectorStore.addDocuments(docs);
			console.log(`Indexed ${docs.length} chunks from ${module} / ${lecture}`);
		}
	}
	console.log("Course fully indexed.");
}

indexCourse("./class-subtitle");
