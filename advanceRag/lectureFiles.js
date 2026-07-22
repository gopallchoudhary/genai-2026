import fs from "fs";
import path from "path";
import { extractOrder, getLectureType } from "./utils.js";

// Turn "01_what-is-mobile-development_epm" -> "What Is Mobile Development"
function cleanName(folderName) {
	return folderName
		.replace(/^mini-project-\d+-/i, "") // "mini-project-1-" prefix
		.replace(/^chapter-\d+-/i, "") // "chapter-2-" prefix
		.replace(/^\d+[_.]\s*/, "") // "01_" or "1. " prefix
		.replace(/_epm$/i, "") // trailing "_epm"
		.replace(/[-_]/g, " ") // dashes/underscores -> spaces
		.replace(/\s+/g, " ") // collapse double spaces
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase()); // title case
}

// Walk: courseDir/module N/NN_lecture-name_epm/*.srt|*.vtt
export function getLectureFiles(courseDir) {
	const lectures = [];
	const moduleDirs = fs
		.readdirSync(courseDir, { withFileTypes: true })
		.filter((d) => d.isDirectory());

	for (const moduleDir of moduleDirs) {
		const modulePath = path.join(courseDir, moduleDir.name);
		const lectureDirs = fs
			.readdirSync(modulePath, { withFileTypes: true })
			.filter((d) => d.isDirectory());

		for (const lectureDir of lectureDirs) {
			const lecturePath = path.join(modulePath, lectureDir.name);
			const files = fs.readdirSync(lecturePath);

			// Prefer .srt, fall back to .vtt, skip if neither exists
			const srt = files.find((f) => f.toLowerCase().endsWith(".srt"));
			const vtt = files.find((f) => f.toLowerCase().endsWith(".vtt"));
			const chosen = srt ?? vtt;
			if (!chosen) continue;

			lectures.push({
				filepath: path.join(lecturePath, chosen),
				module: cleanName(moduleDir.name),
				lecture: cleanName(lectureDir.name),
				lectureOrder: extractOrder(lectureDir.name),
				type: getLectureType(lectureDir.name),
			});
		}
	}
	return lectures;
}
