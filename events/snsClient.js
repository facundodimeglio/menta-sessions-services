require("dotenv").config();
const { SNSClient } = require("@aws-sdk/client-sns");
const { SQSClient } = require("@aws-sdk/client-sqs");

// Obtener configuración de AWS desde variables de entorno
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;

// Verificar que las credenciales estén definidas
if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.error("ERROR: Las credenciales de AWS no están configuradas correctamente.");
    console.error("Por favor, asegúrate de que AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY estén definidas en tu archivo .env");
}

// Configuración de credenciales
const credentials = {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
};

// Agregar sessionToken solo si está definido
if (SESSION_TOKEN) {
    credentials.sessionToken = SESSION_TOKEN;
    console.log("Usando credenciales temporales con session token");
} else {
    console.log("Usando credenciales permanentes sin session token");
}

console.log(`Inicializando clientes AWS en la región: ${REGION}`);

// Configuración del cliente SNS
const snsClient = new SNSClient({
    region: REGION,
    credentials: credentials
});

// Configuración del cliente SQS
const sqsClient = new SQSClient({
    region: REGION,
    credentials: credentials
});

module.exports = { snsClient, sqsClient };