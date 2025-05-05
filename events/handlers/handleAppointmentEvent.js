const { upsertSessionDB } = require("../../models/sessionModel");
const { upsertTherapystDB } = require("../../models/therapystModel");
const { upsertPatientDB } = require("../../models/patientModel");

async function handleAppointmentEvent(eventData) {
    try {
        console.log("Procesando datos de appointment:", JSON.stringify(eventData, null, 2));
        
        // Extraer la información necesaria con manejo de diferentes formatos
        const appointment_id = eventData.id;
        const begin_date = eventData.begin_date;
        const end_date = eventData.end_date;
        const patient_id = eventData.patient_id;
        
        // Manejar diferentes formatos para therapist
        let therapyst_id, therapyst_name;
        
        if (typeof eventData.therapist === 'object' && eventData.therapist !== null) {
            // Si therapist es un objeto con id y name
            therapyst_id = eventData.therapist.id;
            therapyst_name = eventData.therapist.name;
        } else {
            // Si therapist es sólo el ID
            therapyst_id = eventData.therapist;
            therapyst_name = `Terapeuta ${therapyst_id}`; // Nombre genérico
        }
        
        console.log(`Datos extraídos: appointment_id=${appointment_id}, therapyst_id=${therapyst_id}`);

        // Crear/actualizar paciente si tenemos suficientes datos
        if (eventData.patient_name && eventData.patient_email) {
            await upsertPatientDB({
                patient_id,
                patient_name: eventData.patient_name,
                patient_email: eventData.patient_email,
                patient_phone: eventData.patient_phone || ''
            });
            console.log(`Paciente actualizado o creado: ${patient_id}`);
        }

        // Crear/actualizar terapeuta
        if (therapyst_id) {
            await upsertTherapystDB({
                therapyst_id,
                therapyst_name
            });
            console.log(`Terapeuta actualizado o creado: ${therapyst_id}`);
        } else {
            throw new Error("El ID del terapeuta es requerido pero no fue proporcionado");
        }

        // Crear o actualizar la sesión
        const session = await upsertSessionDB({
            appointment_id,
            begin_date,
            end_date,
            patient_id,
            therapyst_id,
            link: null // El link se actualizará cuando se confirme el pago
        });

        console.log(`Sesión ${appointment_id} actualizada o creada correctamente`);
    } catch (error) {
        console.error("Error procesando evento de appointment:", error);
        throw error; // Re-lanzar para manejo adecuado en el nivel superior
    }
}

module.exports = handleAppointmentEvent;