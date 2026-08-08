const { ActionRowBuilder } = require('discord.js');
const { resultBanner } = require('../assets');
const { createDuelResultEmbed, createRematchButton } = require('../embeds/duel-result');
const { handleRematchButton } = require('./rematch-handler');
const { saveDuelResult } = require('../services/api');

function parseDuelResult(customId) {
  const [
    ,
    challengerDiscordId,
    opponentDiscordId,
    winnerDiscordId,
    ft,
    encodedGame,
  ] = customId.split(':');

  return {
    challengerDiscordId,
    opponentDiscordId,
    winnerDiscordId,
    ft: parseInt(ft, 10),
    game: decodeURIComponent(encodedGame),
  };
}

async function handleButton(interaction, client) {
  if (interaction.customId.startsWith('rematch:')) {
    await handleRematchButton(interaction, client);
    return;
  }
  if (!interaction.customId.startsWith('dw:')) return;

  const duel = parseDuelResult(interaction.customId);
  const duelResultPayload = {
    challenger_discord_id: duel.challengerDiscordId,
    opponent_discord_id: duel.opponentDiscordId,
    winner_discord_id: duel.winnerDiscordId,
    ft: duel.ft,
    game: duel.game,
  };

  try {
    const winner = await client.users.fetch(duel.winnerDiscordId);
    const loserId =
      duel.winnerDiscordId === duel.challengerDiscordId
        ? duel.opponentDiscordId
        : duel.challengerDiscordId;
    const loser = await client.users.fetch(loserId);

    try {
      const response = await saveDuelResult(duelResultPayload);
      const duelId = response.data?.data?.id;
      if (!duelId) throw new Error('La API no devolvió el ID del duelo.');

      const row = ActionRowBuilder.from(interaction.message.components[0]);
      row.components.forEach((button) => button.setDisabled(true));
      await interaction.update({ components: [row] });

      await interaction.followUp({
        embeds: [
          createDuelResultEmbed({
            client,
            winner,
            loser,
            ft: duel.ft,
            game: duel.game,
          }),
        ],
        components: [createRematchButton(duelId)],
        files: [resultBanner()],
      });
    } catch (dbError) {
      console.error(
        'Error al guardar el duelo en la API/BD:',
        dbError.response?.data || dbError.message,
      );
      await interaction.reply({
        content: '❌ No se pudo registrar el resultado del duelo.',
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Error procesando el resultado del duelo:', error);
  }
}

module.exports = { handleButton };
