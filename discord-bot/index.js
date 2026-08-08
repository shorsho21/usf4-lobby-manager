require('dotenv').config();

const express = require('express');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { registerCommands } = require('./commands');
const { handleButton } = require('./handlers/button-handler');
const { handleCommand } = require('./handlers/command-handler');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  await registerCommands(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    await handleButton(interaction, client);
    return;
  }

  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction, client);
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🍔 Chun-Burger está despierto y listo para luchar! 🥊');
});

app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
