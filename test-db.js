const pool = require("./db");

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa:", res.rows[0]);
  } catch (err) {
    console.error("Error conectando a la DB:", err);
  } finally {
    await pool.end();
  }
}

testConnection();
