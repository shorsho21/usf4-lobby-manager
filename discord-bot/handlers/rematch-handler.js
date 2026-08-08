const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { duelBanner } = require('../assets');
const { createDuelButtons, createDuelEmbed } = require('../embeds/duel');
const {
  acceptRematch,
  getLobby,
  rejectRematch,
  requestRematch,
} = require('../services/api');

function apiErrorMessage(error) {
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message[0];
  return message || 'No se pudo procesar la revancha. Intentá nuevamente.';
}

async function replyWithError(interaction, error) {
  const response = {
    content: `❌ ${apiErrorMessage(error)}`,
    ephemeral: true,
  };
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(response);
    return;
  }
  await interaction.reply(response);
}

function rematchDecisionButtons(duelId, requestId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`rematch:accept:${duelId}:${requestId}`)
      .setLabel('✅ Aceptar')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`rematch:reject:${duelId}:${requestId}`)
      .setLabel('❌ Rechazar')
      .setStyle(ButtonStyle.Danger),
  );
}

function disabledComponents(message) {
  return message.components.map((component) => {
    const row = ActionRowBuilder.from(component);
    row.components.forEach((button) => button.setDisabled(true));
    return row;
  });
}

async function handleRematchRequest(interaction, client, duelId) {
  try {
    const response = await requestRematch(duelId, interaction.user.id);
    const duel = response.data.data.duel;
    const winner = await client.users.fetch(duel.winner_discord_id);

    await interaction.update({ components: disabledComponents(interaction.message) });
    await interaction.followUp({
      content: `🔄 ${interaction.user} quiere una revancha contra ${winner}.`,
      components: [rematchDecisionButtons(duelId, response.data.data.request.id)],
    });
  } catch (error) {
    await replyWithError(interaction, error);
  }
}

async function handleRematchDecision(interaction, client, action, duelId, requestId) {
  try {
    const response =
      action === 'accept'
        ? await acceptRematch(duelId, interaction.user.id, requestId)
        : await rejectRematch(duelId, interaction.user.id, requestId);
    const { duel, request } = response.data.data;
    const requester = await client.users.fetch(request.requester_discord_id);

    await interaction.update({ components: disabledComponents(interaction.message) });

    if (action === 'reject') {
      await interaction.followUp({
        content: `❌ ${interaction.user} rechazó la solicitud de revancha de ${requester}.`,
      });
      return;
    }

    const lobbyResponse = await getLobby(request.requester_discord_id);
    if (!lobbyResponse.data.success) {
      await interaction.followUp({
        content:
          '⚠️ La revancha fue aceptada, pero el jugador que la solicitó ya no tiene un lobby activo.',
      });
      return;
    }

    const game =
      lobbyResponse.data.game || lobbyResponse.data.gameextrainfo || duel.game;
    const rematchDuel = {
      challenger: requester,
      opponent: interaction.user,
      ft: duel.ft,
      game,
      steamLink: lobbyResponse.data.joinLink,
    };
    await interaction.followUp({
      content: `🔄 **REVANCHA ACEPTADA**\n${interaction.user} aceptó la revancha de ${requester}.`,
    });
    await interaction.followUp({
      embeds: [createDuelEmbed({ client, ...rematchDuel })],
      components: [createDuelButtons(rematchDuel)],
      files: [duelBanner()],
    });
  } catch (error) {
    await replyWithError(interaction, error);
  }
}

async function handleRematchButton(interaction, client) {
  const [, actionOrDuelId, maybeDuelId, requestId] = interaction.customId.split(':');
  if (actionOrDuelId === 'accept' || actionOrDuelId === 'reject') {
    return handleRematchDecision(
      interaction,
      client,
      actionOrDuelId,
      maybeDuelId,
      requestId,
    );
  }
  return handleRematchRequest(interaction, client, actionOrDuelId);
}

module.exports = { handleRematchButton };
