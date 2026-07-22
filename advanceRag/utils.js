import fs from "fs";
import path from "path";
import { Document } from "@langchain/core/documents";

// --- Parse a single SRT or VTT file into cues ---
function parseSubtitleFile(filepath) {
	const raw = fs.readFileSync(filepath, "utf-8");
	const isVTT = filepath.endsWith(".vtt");

	// Normalize: strip VTT header/notes, unify timestamp separator to comma
	let content = raw
		.replace(/^WEBVTT.*\n/, "")
		.replace(/^NOTE.*\n(.*\n)*?\n/gm, "");
	content = content.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2");

	const blocks = content.trim().split(/\n\s*\n/); // blank-line separated cues
	const timeRegex =
		/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/;

	const cues = [];
	for (const block of blocks) {
		const lines = block.split("\n").filter(Boolean);
		const timeLine = lines.find((l) => timeRegex.test(l));
		if (!timeLine) continue;

		const match = timeLine.match(timeRegex);
		const text = lines
			.slice(lines.indexOf(timeLine) + 1)
			.join(" ")
			.replace(/<[^>]+>/g, "") // strip inline VTT tags like <b>, <c>
			.trim();

		if (text) {
			cues.push({
				start: toSeconds(match[1]),
				end: toSeconds(match[2]),
				text,
			});
		}
	}
	return cues;
}

function toSeconds(ts) {
	const [h, m, s] = ts.replace(",", ".").split(":");
	return +h * 3600 + +m * 60 + parseFloat(s);
}

// --- Merge small cues into ~N-second semantic chunks ---
function chunkCues(cues, windowSeconds = 45) {
	const chunks = [];
	let current = { start: null, end: null, text: [] };

	for (const cue of cues) {
		if (current.start === null) current.start = cue.start;
		current.text.push(cue.text);
		current.end = cue.end;

		if (current.end - current.start >= windowSeconds) {
			chunks.push({ ...current, text: current.text.join(" ") });
			current = { start: null, end: null, text: [] };
		}
	}
	if (current.text.length) {
		chunks.push({ ...current, text: current.text.join(" ") });
	}
	return chunks;
}

function formatTimestamp(seconds) {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

// --- Build LangChain Documents with useful metadata ---
export function subtitleFileToDocuments(filepath, { module, lecture } = {}) {
	const cues = parseSubtitleFile(filepath);
	const chunks = chunkCues(cues, 45);

	const lectureFolderName = path.basename(path.dirname(filepath));

	return chunks.map(
		(chunk) =>
			new Document({
				pageContent: chunk.text,
				metadata: {
					source: filepath,
					module: module ?? "",
					lecture: lecture ?? path.basename(filepath),
					lectureOrder: extractOrder(lectureFolderName),
					type: getLectureType(lectureFolderName),
					startTime: chunk.start,
					endTime: chunk.end,
					startTimestamp: formatTimestamp(chunk.start), // e.g. "12:34"
					endTimestamp: formatTimestamp(chunk.end),
				},
			}),
	);
}

export function extractOrder(folderName) {
	const match = folderName.match(/\d+/);
	return match ? parseInt(match[0], 10) : 0;
}

export function getLectureType(folderName) {
	return /^mini-project-/i.test(folderName) ? "mini-project" : "lecture";
}
