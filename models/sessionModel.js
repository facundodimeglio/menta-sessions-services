const pool = require("../db");

const createSessionDB = async ({
    appointment_id,
    begin_date,
    end_date,
    patient_id,
    therapyst_id,
    link = null
}) => {
    const result = await pool.query(
        `INSERT INTO sessions (
            appointment_id,
            title,
            begin_date,
            end_date,
            link,
            patient_id,
            therapyst_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
            appointment_id,
            `Sesión ${appointment_id}`,
            begin_date,
            end_date,
            link,
            patient_id,
            therapyst_id
        ]
    );
    return result.rows[0];
};

const updateSessionDB = async ({ appointment_id, link }) => {
    const result = await pool.query(
        "UPDATE sessions SET link = $1 WHERE appointment_id = $2 RETURNING *",
        [link, appointment_id]
    );
    return result.rows[0];
};

const getSessionByIdDB = async (session_id) => {
    const result = await pool.query(
        "SELECT * FROM sessions WHERE session_id = $1",
        [session_id]
    );
    return result.rows[0];
};

const getSessionByAppointmentId = async (appointment_id) => {
    const result = await pool.query(
        "SELECT * FROM sessions WHERE appointment_id = $1",
        [appointment_id]
    );
    return result.rows[0];
};

/**
 * Crea o actualiza una sesión basada en el ID de cita
 */
const upsertSessionDB = async ({
    appointment_id,
    begin_date,
    end_date,
    patient_id,
    therapyst_id,
    link = null
}) => {
    // Verificar si la sesión ya existe
    const existingSession = await getSessionByAppointmentId(appointment_id);
    
    if (existingSession) {
        // Si existe, actualizar los campos
        const result = await pool.query(
            `UPDATE sessions SET 
                begin_date = $2,
                end_date = $3,
                patient_id = $4,
                therapyst_id = $5,
                link = $6
            WHERE appointment_id = $1 RETURNING *`,
            [
                appointment_id,
                begin_date,
                end_date,
                patient_id,
                therapyst_id,
                link
            ]
        );
        console.log(`Sesión ${appointment_id} actualizada`);
        return result.rows[0];
    } else {
        // Si no existe, crear nueva
        const newSession = await createSessionDB({
            appointment_id,
            begin_date,
            end_date,
            patient_id,
            therapyst_id,
            link
        });
        console.log(`Sesión ${appointment_id} creada`);
        return newSession;
    }
};

const deleteSessionByIdDB = async (session_id) => {
    await pool.query(
        "DELETE FROM sessions WHERE session_id = $1",
        [session_id]
    );
};

const getAllSessionsDB = async () => {
    const result = await pool.query(
        "SELECT * FROM sessions ORDER BY begin_date"
    );
    return result.rows;
};

module.exports = {
    createSessionDB,
    updateSessionDB,
    upsertSessionDB,
    getSessionByIdDB,
    getSessionByAppointmentId,
    deleteSessionByIdDB,
    getAllSessionsDB,
};