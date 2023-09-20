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
    const { searchTerm } = req.body;
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required." });
    }

   
      const result = await pool.query("SELECT DISTINCT vtmid, nm FROM vtm_data WHERE nm ILIKE $1 LIMIT 100", [`%${searchTerm}%`]);
      res.json(result.rows);
   
};

}