const { REST, Routes } = require('discord.js');
const { commands } = require('./definitions');

async function registerCommands(client) {
  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN,
  );

  try {
    console.log('Registrando Slash Commands...');
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log('¡Slash Commands registrados correctamente!');
  } catch (error) {
    console.error('Error al registrar Slash Commands:', error);
  }
}

module.exports = { registerCommands };
