const pool = require("./db");

const createTables = async () => {
  try {
    await pool.query(`
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS therapyst;

-- Crear extensión para UUIDs si no está
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--  Tabla de terapeutas
CREATE TABLE therapyst (
  therapyst_id INTEGER PRIMARY KEY,
  therapyst_name TEXT NOT NULL
);

--  Tabla de pacientes
CREATE TABLE patient (
  patient_id INTEGER PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT
);

CREATE TABLE sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id TEXT NOT NULL,
  title TEXT NOT NULL,
  begin_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  link TEXT,
  patient_id TEXT NOT NULL,
  therapyst_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    console.log("Tablas creadas o ya existían.");
  } catch (err) {
    console.error("Error creando tablas:", err);
  } finally {
    await pool.end();
  }
};

createTables();
