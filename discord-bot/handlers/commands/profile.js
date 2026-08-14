const { getProfile } = require('../../services/api');
const { createProfileEmbed } = require('../../embeds/profile');//importo el creador de embeds de profile

async function handleProfile(interaction) {
  try {
    const response = await getProfile(interaction.user.id);
    const profile = response.data;

    await interaction.reply({
        //respondemos con un embed y le pasamos la info del usuario y su perfil
      embeds: [createProfileEmbed({ user: interaction.user, profile })],
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    if (error.response?.status === 404) {
      await interaction.reply({
        content: '❌🍔 Todavía no estás registrado. Usá `/setsteam` primero.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: '❌🍔 No pude obtener tu perfil. Intenta nuevamente.',
      ephemeral: true,
    });
  }
}

module.exports = { handleProfile };