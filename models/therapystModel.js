const pool = require("../db");

const createTherapystDB = async ({ therapyst_id, therapyst_name }) => {
    const result = await pool.query(
        "INSERT INTO therapyst (therapyst_id, therapyst_name) VALUES ($1, $2) RETURNING *",
        [therapyst_id, therapyst_name]
    );
    return result.rows[0];
};

const getTherapystByIdDB = async (therapyst_id) => {
    const result = await pool.query(
        "SELECT * FROM therapyst WHERE therapyst_id = $1",
        [therapyst_id]
    );
    return result.rows[0];
};

/**
 * Actualiza un terapeuta existente o lo crea si no existe
 */
const upsertTherapystDB = async ({ therapyst_id, therapyst_name }) => {
    // Primero verificamos si el terapeuta existe
    const existingTherapyst = await getTherapystByIdDB(therapyst_id);
    
    if (existingTherapyst) {
        // Si existe, lo actualizamos
        const result = await pool.query(
            "UPDATE therapyst SET therapyst_name = $2 WHERE therapyst_id = $1 RETURNING *",
            [therapyst_id, therapyst_name]
        );
        console.log(`Terapeuta ${therapyst_id} actualizado`);
        return result.rows[0];
    } else {
        // Si no existe, lo creamos
        const result = await createTherapystDB({ therapyst_id, therapyst_name });
        console.log(`Terapeuta ${therapyst_id} creado`);
        return result;
    }
};

module.exports = {
    createTherapystDB,
    getTherapystByIdDB,
    upsertTherapystDB
};