const pool = require("../db");

const createPatientDB = async ({ patient_id, patient_name, patient_email, patient_phone }) => {
    const result = await pool.query(
        "INSERT INTO patient (patient_id, patient_name, patient_email, patient_phone) VALUES ($1, $2, $3, $4) RETURNING *",
        [patient_id, patient_name, patient_email, patient_phone]
    );
    return result.rows[0];
};

const getPatientByIdDB = async (patient_id) => {
    const result = await pool.query(
        "SELECT * FROM patient WHERE patient_id = $1",
        [patient_id]
    );
    return result.rows[0];
};

/**
 * Actualiza un paciente existente o lo crea si no existe
 */
const upsertPatientDB = async ({ patient_id, patient_name, patient_email, patient_phone }) => {
    // Primero verificamos si el paciente existe
    const existingPatient = await getPatientByIdDB(patient_id);
    
    if (existingPatient) {
        // Si existe, lo actualizamos
        const result = await pool.query(
            "UPDATE patient SET patient_name = $2, patient_email = $3, patient_phone = $4 WHERE patient_id = $1 RETURNING *",
            [patient_id, patient_name, patient_email, patient_phone]
        );
        console.log(`Paciente ${patient_id} actualizado`);
        return result.rows[0];
    } else {
        // Si no existe, lo creamos
        const result = await createPatientDB({ patient_id, patient_name, patient_email, patient_phone });
        console.log(`Paciente ${patient_id} creado`);
        return result;
    }
};

module.exports = {
    createPatientDB,
    getPatientByIdDB,
    upsertPatientDB
};