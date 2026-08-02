require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('clientReady', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignorar mensajes de otros bots
  if (message.author.bot) return;

  // Comando !lobby
  if (message.content === '!lobby') {
    try {
      await message.reply('🔎 Buscando lobby de USF4...');

      const response = await axios.get(`${process.env.API_URL}/steam/lobby`);

      if (!response.data.success) {
        await message.reply(`❌ ${response.data.message}`);

        return;
      }

      const steamLink = response.data.joinLink;

      const embed = new EmbedBuilder()
        .setTitle('🥊 Lobby de Ultra Street Fighter IV')
        .setDescription(
          'Un nuevo lobby está disponible.\n\n' +
            '🎮 **Link de conexión:**\n' +
            `\`\`\`\n${steamLink}\n\`\`\``,
        )
        .setAuthor({
          name: `${message.author.username} creó el lobby`,
          iconURL: message.author.displayAvatarURL({
            size: 256,
          }),
        })
        .setThumbnail(
          message.author.displayAvatarURL({
            size: 256,
          }),
        )
        .addFields(
          {
            name: '👤 Jugador',
            value: `<@${message.author.id}>`,
            inline: true,
          },
          {
            name: '🎮 Juego',
            value: response.data.game,
            inline: true,
          },
          {
            name: '🟢 Estado',
            value: 'Lobby activo',
            inline: true,
          },
        )
        .setFooter({
          text: 'SF4 Tournament Bot • Ultra Street Fighter IV',
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error.response?.data || error.message);

      await message.reply('❌ Error comunicándose con la API.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
