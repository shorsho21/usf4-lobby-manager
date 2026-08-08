const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

function createDuelEmbed({ client, challenger, opponent, ft, game, steamLink }) {
  return new EmbedBuilder()
    .setColor(0xdc2626)
    .setTitle('⚔️ CHUN-BURGER MATCH')
    .setDescription(
      `# 🥊 ${challenger.username}  🆚  ${opponent.username}\n\n` +
        `> **"${challenger.username}" ha lanzado un desafío.**\n\n` +
        `🔥 **First To:**${ft}\n` +
        `🎮 **Juego:** ${game}\n` +
        '📡 **Estado:** 🟢 Lobby disponible',
    )
    .setAuthor({
      name: '🍔 Chun-Burger Matchmaking',
      iconURL: client.user.displayAvatarURL(),
    })
    .setThumbnail(challenger.displayAvatarURL({ size: 512 }))
    .setImage('attachment://duel-chun-li.png')
    .addFields(
      {
        name: '🥊 Retador',
        value: `${challenger}\n🟢 Preparado`,
        inline: true,
      },
      {
        name: '🎯 Retado',
        value: `${opponent}\n⚔️ Esperando respuesta`,
        inline: true,
      },
      {
        name: '━━━━━━━━━━━━━━━━━━',
        value: `### 🔗 Steam Lobby\n\`\`\`\n${steamLink}\n\`\`\``,
      },
    )
    .setFooter({
      text: '🍔 Ready? Fight!',
      iconURL: client.user.displayAvatarURL(),
    })
    .setTimestamp();
}

function createDuelButtons({ challenger, opponent, ft, game }) {
  const encodedGame = encodeURIComponent(game);
  const createCustomId = (winnerId) =>
    `dw:${challenger.id}:${opponent.id}:${winnerId}:${ft}:${encodedGame}`;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(createCustomId(challenger.id))
      .setLabel(`🏆 ${challenger.username}`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(createCustomId(opponent.id))
      .setLabel(`🏆 ${opponent.username}`)
      .setStyle(ButtonStyle.Primary),
  );
}

module.exports = { createDuelButtons, createDuelEmbed };
