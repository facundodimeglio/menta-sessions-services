require("dotenv").config();
const { snsClient } = require("./snsClient");
const { PublishCommand } = require("@aws-sdk/client-sns");

/**
 * Publica un evento en un tópico SNS
 * @param {string} topicName - Nombre del tópico ('appointment' o 'billing')
 * @param {string} eventName - Nombre del evento (usado como Subject)
 * @param {object} message - Mensaje a publicar
 * @returns {Promise<object>} - Respuesta de AWS SNS
 */
async function publishEvent(topicName, eventName, message) {
    try {
        // Determinar el ARN del tópico basado en el nombre
        let topicArn;
        if (topicName === 'appointment') {
            topicArn = process.env.SNS_APPOINTMENT_TOPIC_ARN;
        } else if (topicName === 'billing') {
            topicArn = process.env.SNS_BILLING_TOPIC_ARN;
        } else {
            throw new Error(`Tópico desconocido: ${topicName}`);
        }

        if (!topicArn) {
            throw new Error(`ARN no configurado para el tópico: ${topicName}`);
        }

        const command = new PublishCommand({
            TopicArn: topicArn,
            Message: JSON.stringify(message),
            Subject: eventName
        });

        const response = await snsClient.send(command);
        console.log(`Evento '${eventName}' publicado exitosamente en ${topicArn}:`, response.MessageId);
        
        // Verificar el estado de la respuesta
        const status = response.$metadata?.httpStatusCode === 200 ? "success" : "error";
        console.log(`Estado de la publicación: ${status}`);
        
        return response;
    } catch (error) {
        console.error("Error publicando evento:", error);
        throw error;
    }
}

module.exports = publishEvent;