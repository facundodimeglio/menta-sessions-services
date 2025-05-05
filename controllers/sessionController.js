const { createSessionDB, getSessionByIdDB, deleteSessionByIdDB } = require("../models/sessionModel");
const { v4: uuidv4 } = require("uuid");

exports.createSession = async (req, res) => {
    try {
        const { appointment_id, title, begin_date, end_date, patient_id, therapyst_id } = req.body;

        // Usamos un UUID para generar un nombre único de sala Jitsi
        const roomId = uuidv4();
        const meetingUrl = `https://meet.jit.si/menta#${roomId}`;

        const sessionData = {
            appointment_id,
            title,
            begin_date,
            end_date,
            link: meetingUrl,
            patient_id,
            therapyst_id,
        };

        const newSession = await createSessionDB(sessionData);

        res.status(201).json(newSession);
    } catch (err) {
        console.error("Error al crear sesión:", err);
        res.status(500).json({ error: "Error al crear sesión" });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await getSessionByIdDB(sessionId);

        if (!session) {
            return res.status(404).json({ error: "Sesión no encontrada" });
        }

        res.json(session);
    } catch (err) {
        console.error("Error al obtener sesión:", err);
        res.status(500).json({ error: "Error al obtener sesión" });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        await deleteSessionByIdDB(sessionId);
        res.status(204).send();
    } catch (err) {
        console.error("Error al eliminar sesión:", err);
        res.status(500).json({ error: "Error al eliminar sesión" });
    }
};