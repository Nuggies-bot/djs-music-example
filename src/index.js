require('dotenv').config();
const Client = require('./structures/Client');
const client = new Client({ intents: 32767 });
client.setup();