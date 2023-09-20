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



export default async (req, res) => {
    if (req.method === 'GET') {
      const { medicationCode, type } = req.query;  // Extract from query parameters
      if (!medicationCode) {
        return res.status(400).json({ error: "Medication code is required." });
      }
  
        const numberQuery = `
        SELECT 
    
    SUM(TOTAL_QUANITY_IN_VMP_UNIT) AS total_usage,
    unit_of_measure_name AS unit_name,
    ods_data.name AS ods_name,
    ods_data.code AS ods_code
FROM 
    secondary_care_medicines_data 
INNER JOIN 
    unit_code_name_mapping 
ON 
    unit_code_name_mapping.unit_of_measure_identifier = secondary_care_medicines_data.unit_of_measure_identifier
INNER JOIN
      ods_data
ON
      ods_data.code = secondary_care_medicines_data.ods_code
WHERE 
    VMP_SNOMED_CODE = $1 
GROUP BY 
   
    secondary_care_medicines_data.unit_of_measure_identifier, 
    unit_code_name_mapping.unit_of_measure_name,
    ods_data.code,
    ods_data.name
ORDER BY 
    total_usage DESC;`;
         const result = await pool.query(numberQuery, [medicationCode]);
        res.json(result.rows);
      
    }

  };