import db from "../../../config/db.js";

const updateCandidateInfoById = async (id, data) => {
  try {
    console.log("Model: Updating candidate ID:", id);
    console.log("Model: Update data:", data);
    
    // Build SET clause dynamically
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    if (fields.length === 0) {
      throw new Error("No fields to update");
    }
    
    // Add updated_at timestamp
    fields.push('updated_at');
    values.push(new Date());
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    // Add id to values array for WHERE clause
    values.push(id);
    
    const query = `UPDATE candidates SET ${setClause} WHERE id = ?`;
    
    console.log("Model: Query:", query);
    console.log("Model: Values:", values);
    
    const [result] = await db.query(query, values);
    
    console.log("Model: Update result:", result);
    return result;
    
  } catch (error) {
    console.error("Model update error:", error);
    throw error;
  }
};

export default updateCandidateInfoById;