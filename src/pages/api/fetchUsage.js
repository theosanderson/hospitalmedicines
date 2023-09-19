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
  
        const numberQuery = "SELECT YEAR_MONTH, SUM(TOTAL_QUANITY_IN_VMP_UNIT) AS total_usage, unit_of_measure_name  as unit_name FROM secondary_care_medicines_data INNER JOIN unit_code_name_mapping ON  unit_code_name_mapping.unit_of_measure_identifier = secondary_care_medicines_data.unit_of_measure_identifier WHERE VMP_SNOMED_CODE = $1 GROUP BY YEAR_MONTH, secondary_care_medicines_data.unit_of_measure_identifier, unit_code_name_mapping.unit_of_measure_name ORDER BY YEAR_MONTH";
        const priceQuery = "SELECT YEAR_MONTH, SUM(indicative_cost) AS total_cost, unit_of_measure_name  as unit_name FROM secondary_care_medicines_data INNER JOIN unit_code_name_mapping ON  unit_code_name_mapping.unit_of_measure_identifier = secondary_care_medicines_data.unit_of_measure_identifier WHERE VMP_SNOMED_CODE = $1 GROUP BY YEAR_MONTH, secondary_care_medicines_data.unit_of_measure_identifier, unit_code_name_mapping.unit_of_measure_name ORDER BY YEAR_MONTH"
        const result = await pool.query( type=="number" ? numberQuery : priceQuery, [medicationCode]);
        res.json(result.rows);
      
    }

  };