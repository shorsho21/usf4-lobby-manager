const { lobbyBanner } = require('../../assets');
const { createLobbyEmbed } = require('../../embeds/lobby');
const { getLobby } = require('../../services/api');

async function handleLobby(interaction, client) {
  await interaction.deferReply();

  try {
    const response = await getLobby(interaction.user.id);
    const gameName = response.data.game || response.data.gameextrainfo || 'Juego';

    if (!response.data.success) {
      await interaction.editReply(
        `🍔💨 ¡Kikosho fallido... 🥺!\n\n` +
          `🥺 No pude encontrar tu hamburguesa... quiero decir tu lobby:\n` +
          `🌱 Abre tu sala de **${gameName}** y volveré a buscarla por ti, luchador. 🥊`,
      );
      return;
    }

    const embed = createLobbyEmbed({
      client,
      user: interaction.user,
      gameName,
      steamLink: response.data.joinLink,
    });
    await interaction.editReply({ embeds: [embed], files: [lobbyBanner()] });
  } catch (error) {
    console.error(error.response?.data || error.message);
    await interaction.editReply('❌ Error comunicándose con la API.');
  }
}

module.exports = { handleLobby };
