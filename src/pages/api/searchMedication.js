import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  password: process.env.DB_PASSWORD,
  
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  ssl: {
    rejectUnauthorized: false
  }
});

// ... other imports ...

export default async (req, res) => {
  if (req.method === 'POST') {
    const { searchTerm, mode } = req.body;
    console.log("searchTerm", searchTerm);
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required." });
    }

    const query = mode == "Formulations" ? 
    "SELECT DISTINCT VMP_SNOMED_CODE, VMP_PRODUCT_NAME FROM vmp_code_name_mapping WHERE VMP_PRODUCT_NAME ILIKE $1 LIMIT 100"
    :
    "SELECT DISTINCT isid, nm FROM ingredient_data WHERE nm ILIKE $1 LIMIT 100"

   
      const result = await pool.query(query, [`%${searchTerm}%`]);
      res.json(result.rows);
   
};

}