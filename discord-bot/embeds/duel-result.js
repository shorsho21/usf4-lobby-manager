const { EmbedBuilder } = require('discord.js');

function createDuelResultEmbed({ client, winner, loser, ft, game }) {
  return new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle('🏆  ¡DUEL FINALIZADO!')
    .setDescription(
      `## 🥇 Victoria de ${winner}\n\n` +
        `🔥 **${winner.username}** se lleva el combate.\n\n` +
        `🥊 **Formato:** FT${ft}\n` +
        `🎮 **Juego:** ${game}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👏 ¡Felicitaciones campeón!\n\n` +
        `GG ${loser} 🍔`,
    )
    .setThumbnail(winner.displayAvatarURL({ size: 512 }))
    .setImage('attachment://banner-chun-li.png')
    .addFields(
      { name: '🏆 Ganador', value: `${winner}`, inline: true },
      { name: '💀 Derrotado', value: `${loser}`, inline: true },
      { name: '⚔️ Resultado', value: `FT${ft}`, inline: true },
    )
    .setFooter({
      text: '🍔 Chun-Burger Challenge • GGWP',
      iconURL: client.user.displayAvatarURL({ size: 128 }),
    })
    .setTimestamp();
}

module.exports = { createDuelResultEmbed };
