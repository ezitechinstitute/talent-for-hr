import db from "../../../config/db.js";
import { Parser } from "json2csv";

const exportCandidatesCSV = async () => {
    const [rows] = await db.query("SELECT * FROM candidates");
    if (!rows || rows.length === 0) {
        throw new Error("No candidates found");
    }
    const parser = new Parser();
    return parser.parse(rows);
};

export default exportCandidatesCSV;