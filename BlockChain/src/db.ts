import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Abcd1234",
  port: 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);