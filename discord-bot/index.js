require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const axios = require('axios');

const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function getUsers() {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');

  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

client.once('clientReady', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignorar bots
  if (message.author.bot) return;

  /*
    ====================================
            COMANDO SETSTEAM
    ====================================
    */

  if (message.content.startsWith('!setsteam')) {
    const args = message.content.split(' ');

    const steamProfile = args[1];

    if (!steamProfile) {
      await message.reply('❌ Uso correcto: `!setsteam <steam_profile>`');

      return;
    }

    const users = getUsers();

    const existingUser = users.find(
      (user) => user.discordId === message.author.id,
    );

    if (existingUser) {
      existingUser.steamProfile = steamProfile;

      existingUser.username = message.author.username;
    } else {
      users.push({
        discordId: message.author.id,

        username: message.author.username,

        steamProfile: steamProfile,
      });
    }

    saveUsers(users);

    await message.reply(`✅ Steam vinculado correctamente:\n${steamProfile}`);

    return;
  }

  /*
    ====================================
              COMANDO LOBBY
    ====================================
    */

  if (message.content === '!lobby') {
    try {
      await message.reply('🔎 Buscando lobby de USF4...');

      const response = await axios.get(
        `${process.env.API_URL}/steam/lobby/${message.author.id}`,
      );

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
