const { Pool } = require('pg');
const config = require("../config/dev");

const connectionString = `postgresql://${config.DB_USER}:${config.DB_PW}@${config.DB_HOST}:${config.DB_PORT}/${config.DB}`;

const pool = new Pool({
  connectionString: connectionString,
});

async function fixNullRecords() {
  try {
    console.log("Starting to fix null status and last_attempt records...");

    // Fix records with null status
    const statusResult = await pool.query(`
      UPDATE public.dhis_aggregate
      SET status = 'PENDING'
      WHERE status IS NULL
    `);
    console.log(`Fixed ${statusResult.rowCount} records with NULL status`);

    // Fix records with null last_attempt
    const lastAttemptResult = await pool.query(`
      UPDATE public.dhis_aggregate
      SET last_attempt = now() at time zone 'Africa/Johannesburg'
      WHERE last_attempt IS NULL
    `);
    console.log(`Fixed ${lastAttemptResult.rowCount} records with NULL last_attempt`);

    console.log("All null records have been fixed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing null records:", err);
    process.exit(1);
  }
}

fixNullRecords();
