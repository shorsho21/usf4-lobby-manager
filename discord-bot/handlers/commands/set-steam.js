const { saveSteamProfile } = require('../../services/api');

async function handleSetSteam(interaction) {
  const steamProfile = interaction.options.getString('steam_profile');

  try {
    const response = await saveSteamProfile({
      discordId: interaction.user.id,
      username: interaction.user.username,
      steamProfile,
    });

    if (response.data.success) {
      await interaction.reply(
        `🍔🌸 ¡Listo luchador! Guardé tu perfil de Steam.\n\n` +
          `🎮 ${steamProfile}\n\n` +
          'Ahora Chun-Burger podrá encontrar tus lobbies cuando quieras 🥊✨',
      );
      return;
    }

    await interaction.reply({
      content: '❌🍔 No pude guardar tu perfil de Steam. Intenta nuevamente.',
      ephemeral: true,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    if (!interaction.replied) {
      await interaction.reply({
        content: '❌🍔 No pude guardar tu perfil de Steam. Intenta nuevamente.',
        ephemeral: true,
      });
    }
  }
}

module.exports = { handleSetSteam };
