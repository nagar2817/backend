import pkg from 'pg';
const {Pool} = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DB;

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Use this line if your Render PostgreSQL requires SSL
  });
  
  // Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error', err);
    } else {
      console.log('Connected to the database');
    }
  });

export default pool;


