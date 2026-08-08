const { EmbedBuilder } = require('discord.js');

function createLobbyEmbed({ client, user, gameName, steamLink }) {
  return new EmbedBuilder()
    .setTitle(`🥊 Lobby de ${gameName} activo`)
    .setDescription(
      'Un nuevo lobby está disponible.\n\n' +
        '🎮 **Link de conexión:**\n' +
        `\`\`\`\n${steamLink}\n\`\`\``,
    )
    .setAuthor({
      name: `${user.username} creó el lobby`,
      iconURL: user.displayAvatarURL({ size: 256 }),
    })
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .setImage('attachment://lobby-chun-li.png')
    .addFields(
      { name: '👤 Jugador', value: `<@${user.id}>`, inline: true },
      { name: '🎮 Juego', value: gameName, inline: true },
      { name: '🟢 Estado', value: 'Lobby activo', inline: true },
    )
    .setFooter({
      text: `Chun Burger bot • ${gameName}`,
      iconURL: client.user.displayAvatarURL(),
    })
    .setTimestamp();
}

module.exports = { createLobbyEmbed };
