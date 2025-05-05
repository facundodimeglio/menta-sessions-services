const publishEvent = require("../publishEvent");
const { getSessionByAppointmentId, updateSessionDB } = require("../../models/sessionModel");
const { v4: uuidv4 } = require("uuid");

async function handlePaymentEvent(eventData) {
    try {
        const { appointment_id, payment_status } = eventData;

        if (payment_status === "approved") {
            const session = await getSessionByAppointmentId(appointment_id);

            if (session) {
                // Generar link único para la reunión
                const roomId = uuidv4();
                const meetingUrl = `https://meet.jit.si/menta#${roomId}`;

                // Actualizar la sesión con el link
                const updatedSession = await updateSessionDB({
                    appointment_id,
                    link: meetingUrl
                });

                // Publicar evento de sesión lista
                await publishEvent(
                    "appointment",
                    "appointment-updated",
                    {
                        appointment_id: updatedSession.appointment_id,
                        link: updatedSession.link,
                        begin_date: updatedSession.begin_date,
                        end_date: updatedSession.end_date,
                        patient_id: updatedSession.patient_id,
                        therapyst_id: updatedSession.therapyst_id
                    }
                );

                console.log("Evento appointment-updated publicado para la sesión:", updatedSession.appointment_id);
            } else {
                console.error("No se encontró la sesión para el appointment_id:", appointment_id);
            }
        }
    } catch (error) {
        console.error("Error procesando evento de pago:", error);
    }
}

module.exports = handlePaymentEvent;