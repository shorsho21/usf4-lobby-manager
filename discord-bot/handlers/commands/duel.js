const { duelBanner } = require('../../assets');
const { createDuelButtons, createDuelEmbed } = require('../../embeds/duel');
const { getLobby } = require('../../services/api');

async function handleDuel(interaction, client) {
  const opponent = interaction.options.getUser('jugador');
  const ft = interaction.options.getInteger('ft');

  if (opponent.id === interaction.user.id) {
    await interaction.reply({
      content: '😂 No puedes retarte a ti mismo.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const response = await getLobby(interaction.user.id);
    if (!response.data.success) {
      await interaction.editReply('❌ No tienes un lobby activo.');
      return;
    }

    const game = response.data.game || response.data.gameextrainfo || 'Juego desconocido';
    const duel = {
      challenger: interaction.user,
      opponent,
      ft,
      game,
      steamLink: response.data.joinLink,
    };

    await interaction.editReply({
      embeds: [createDuelEmbed({ client, ...duel })],
      components: [createDuelButtons(duel)],
      files: [duelBanner()],
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply('❌ Error al crear el duelo.');
  }
}

module.exports = { handleDuel };
