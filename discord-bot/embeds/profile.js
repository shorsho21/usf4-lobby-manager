const { EmbedBuilder } = require('discord.js');

function createProfileEmbed({ user, profile }) {
  return new EmbedBuilder()
    .setColor(0xdc2626)
    .setTitle(`🥊 Perfil de ${user.username}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '🏆 Victorias', value: `${profile.wins}`, inline: true },
      { name: '💀 Derrotas', value: `${profile.losses}`, inline: true },
      { name: '📊 Win Rate', value: `${profile.winRate}%`, inline: true },
      { name: '🎮 Steam', value: profile.steamProfile || 'No configurado' },
    )
    .setFooter({ text: '🍔 Chun-Burger Profile' })
    .setTimestamp();
}

module.exports = { createProfileEmbed };