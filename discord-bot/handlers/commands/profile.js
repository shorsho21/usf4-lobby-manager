const { getProfile } = require('../../services/api');
const { createProfileEmbed } = require('../../embeds/profile');//importo el creador de embeds de profile

async function handleProfile(interaction) {
  const targetUser =
    interaction.options.getUser('usuario') ||
    interaction.options.getUser('jugador') ||
    interaction.user;
  const isSelf = targetUser.id === interaction.user.id;

  try {
    const response = await getProfile(targetUser.id);
    const profile = response.data;

    await interaction.reply({
      // respondemos con un embed y le pasamos la info del usuario y su perfil
      embeds: [createProfileEmbed({ user: targetUser, profile })],
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    if (error.response?.status === 404) {
      await interaction.reply({
        content: isSelf
          ? '❌🍔 Todavía no estás registrado. Usá `/setsteam` primero.'
          : `❌🍔 **${targetUser.username}** todavía no está registrado/a en Chun-Burger.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: isSelf
        ? '❌🍔 No pude obtener tu perfil. Intenta nuevamente.'
        : `❌🍔 No pude obtener el perfil de **${targetUser.username}**. Intenta nuevamente.`,
      ephemeral: true,
    });
  }
}

module.exports = { handleProfile };