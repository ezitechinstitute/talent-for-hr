import db from "../../../config/db.js";
import bcrypt from "bcryptjs";

const resetCandidatePassword = async (id, newPassword) => {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await db.query(
        "UPDATE candidates SET password = ? WHERE id = ?", 
        [hashed, id]
    );
    return result;
};

export default resetCandidatePassword;