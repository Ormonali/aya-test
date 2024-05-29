import express from 'express';
import pg from "pg"
const { Pool } = pg
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = 3000

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

app.get('/rewards', async (req, res) => {
    const rewardPool = 10000
    const query = `
        WITH EmployeeDonations AS (
        SELECT employee_id, SUM(amount) AS total_donated
        FROM Donation
        GROUP BY employee_id
        ),
        TotalDonations AS (
        SELECT SUM(total_donated) AS total_donations
        FROM EmployeeDonations
        ),
        EligibleEmployees AS (
        SELECT employee_id, total_donated
        FROM EmployeeDonations
        WHERE total_donated > 100
        )
        SELECT e.id, e.name, e.surname, ed.total_donated,
        (ed.total_donated / td.total_donations) * ${rewardPool} AS reward
        FROM Employee e
        JOIN EligibleEmployees ed ON e.id = ed.employee_id
        CROSS JOIN TotalDonations td
        ORDER BY reward;
    `;

  try {
    const { rows } = await pool.query(query)
    res.json(rows)
  } catch (err) {
    console.error('Error executing query:', err)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
