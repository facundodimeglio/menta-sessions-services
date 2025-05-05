require("dotenv").config();
const { ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const { sqsClient } = require("./snsClient");
const handleAppointmentEvent = require("./handlers/handleAppointmentEvent");
const handlePaymentEvent = require("./handlers/handlePaymentEvent");

// Usar la URL de la cola desde variables de entorno
const SESSIONS_QUEUE_URL = process.env.SQS_QUEUE_URL;

// Verificar que la URL de la cola esté definida
if (!SESSIONS_QUEUE_URL) {
    console.error("ERROR: La URL de la cola SQS no está configurada correctamente.");
    console.error("Por favor, asegúrate de que SQS_QUEUE_URL esté definida en tu archivo .env");
    process.exit(1);
}

console.log(`Configurado para escuchar eventos de la cola: ${SESSIONS_QUEUE_URL}`);

async function processMessage(message) {
    let messageDeleted = false;
    try {
        console.log("Mensaje recibido:", message.MessageId);
        
        // Intentar analizar el cuerpo del mensaje
        let body;
        try {
            body = JSON.parse(message.Body);
        } catch (parseError) {
            console.error("Error al analizar el mensaje JSON:", parseError);
            console.log("Mensaje con formato incorrecto:", message.Body);
            await deleteMessage(message.ReceiptHandle);
            messageDeleted = true;
            return;
        }
        
        // Verificar si tiene la estructura esperada de SNS
        if (!body.TopicArn || !body.Message) {
            console.warn("Mensaje no tiene la estructura esperada de SNS, intentando procesar directamente");
            if (body.id && body.begin_date && body.end_date) {
                // Parece ser un mensaje de appointment directo
                await handleAppointmentEvent(body);
            } else if (body.appointment_id && body.payment_status) {
                // Parece ser un mensaje de pago directo
                await handlePaymentEvent(body);
            } else {
                console.error("Formato de mensaje desconocido:", body);
            }
            await deleteMessage(message.ReceiptHandle);
            messageDeleted = true;
            return;
        }
        
        const { TopicArn, Subject, Message } = body;
        
        console.log(`Procesando mensaje SNS: Topic=${TopicArn}, Subject=${Subject || 'no subject'}`);
        
        // Parsear el mensaje interno
        let messageData;
        try {
            messageData = JSON.parse(Message);
        } catch (parseError) {
            console.error("Error al analizar el contenido del mensaje:", parseError);
            console.log("Contenido del mensaje con formato incorrecto:", Message);
            await deleteMessage(message.ReceiptHandle);
            messageDeleted = true;
            return;
        }

        // Determinar el tipo de evento basado en el TopicArn
        if (TopicArn.includes("appointment")) {
            if (Subject === "appointment-created") {
                await handleAppointmentEvent(messageData);
            } else {
                console.log(`Ignorando evento de appointment con subject '${Subject}'`);
            }
        } else if (TopicArn.includes("billing")) {
            if (Subject === "payment-approved") {
                await handlePaymentEvent(messageData);
            } else {
                console.log(`Ignorando evento de billing con subject '${Subject}'`);
            }
        } else {
            console.log(`Topic no reconocido: ${TopicArn}`);
        }

        // Eliminar mensaje de la cola
        await deleteMessage(message.ReceiptHandle);
        messageDeleted = true;
        console.log("Mensaje procesado y eliminado de la cola");
    } catch (err) {
        console.error("Error procesando mensaje:", err);
        
        // Solo intentamos eliminar si no se ha eliminado ya
        if (!messageDeleted) {
            try {
                // Eliminamos el mensaje incluso si hay error para evitar reprocesamiento
                // En producción, podrías querer usar una cola de dead letter en su lugar
                await deleteMessage(message.ReceiptHandle);
                console.log("Mensaje con error eliminado de la cola");
            } catch (deleteErr) {
                console.error("Error al eliminar mensaje tras error:", deleteErr);
            }
        }
    }
}

async function deleteMessage(receiptHandle) {
    try {
        await sqsClient.send(
            new DeleteMessageCommand({
                QueueUrl: SESSIONS_QUEUE_URL,
                ReceiptHandle: receiptHandle,
            })
        );
    } catch (err) {
        console.error("Error eliminando mensaje:", err);
        throw err;
    }
}

async function pollMessages() {
    const command = new ReceiveMessageCommand({
        QueueUrl: SESSIONS_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20, // Long polling para reducir costos y latencia
    });

    try {
        console.log("Consultando mensajes de la cola...");
        const response = await sqsClient.send(command);
        if (response.Messages && response.Messages.length > 0) {
            console.log(`Se encontraron ${response.Messages.length} mensajes en la cola`);
            for (const message of response.Messages) {
                await processMessage(message);
            }
        }
    } catch (err) {
        console.error("Error en el polling:", err);
    }
}

function startPolling() {
    console.log("Iniciando servicio de escucha de eventos...");
    // Llamar a pollMessages inmediatamente
    pollMessages();
    // Y luego cada 5 segundos
    setInterval(pollMessages, 5000);
}

module.exports = startPolling;