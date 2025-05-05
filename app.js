require('dotenv').config();
const startPolling = require("./events/subscribeToEvents");

// Iniciar el polling de eventos
startPolling();

console.log('Sessions service started and listening for events...');
