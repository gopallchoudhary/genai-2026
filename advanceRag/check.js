import { getLectureFiles } from "./lectureFiles.js";
import path from "path";


const lectures = getLectureFiles("./class-subtitle");
const patterns = new Set(
	lectures.map((l) =>
		path.basename(path.dirname(l.filepath))
			.replace(/\d+/g, "N")
	)
);
console.log([...patterns].sort());

// also spot-check the cleaned output looks right
console.log(lectures.map((l) => `[${l.module}] ${l.type} #${l.lectureOrder}: ${l.lecture}`));