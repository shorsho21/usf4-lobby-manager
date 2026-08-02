require('dotenv').config();
const express = require("express");
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

  if (message.content.startsWith('/setsteam')) {
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

    await message.reply(
      `✅ Déjame guardar tu Steam para poder encontrarte en batalla.:\n${steamProfile}`,
    );

    return;
  }

  /*
    ====================================
              COMANDO LOBBY
    ====================================
    */

  if (message.content === '/lobby') {
    try {
      await message.reply('Voy a buscar tu hamburguesa... digo, tu lobby 😋');

      const response = await axios.get(
        `${process.env.API_URL}/steam/lobby/${message.author.id}`,
      );

      if (!response.data.success) {
        await message.reply(
          `🍔💨 ¡Kikosho fallido... 🥺!\n\n` +
            `🥺 No pude encontrar tu hamburguesa...quiero decir tu lobby 🥺:\n` +
            `${response.data.message}\n\n` +
            `🌱 Abre tu sala de **Ultra Street Fighter IV** y volveré a buscarla por ti, luchador. 🥊`,
        );
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

  /*
    ====================================
              COMANDO HELP
    ====================================
    */
  if (message.content === '/help') {
    await message.reply(
      '🍔🌸 **Chun-Burger Command List** 🥊\n\n' +
        '✨ ¡Konnichiwa, luchador! Estos son mis movimientos especiales:\n\n' +
        '🥋 `/setsteam "link perfil de steam"`\n' +
        '→ Guarda tu Steam para poder ayudarte a encontrar partidas.\n\n' +
        '💨 `/lobby`\n' +
        '→ Busco tu lobby de Ultra Street Fighter IV con mi poder de Kikosho.\n\n' +
        '📖 `/help`\n' +
        '→ Te muestro todos mis comandos disponibles.\n\n' +
        '🍔 `/about`\n' +
        '→ Te cuento quién soy y por qué estoy aquí.\n\n' +
        '🌟 ¡Buena suerte en tus combates, luchador!',
    );
  }

  /*
    ====================================
              COMANDO ABOUT
    ====================================
    */

  if (message.content === '/about') {
    await message.reply(
      '🍔 **Chun-Burger Bot**\n\n' +
        '🌸 ¡Konnichiwa, luchador! Soy Chun-Burger 🥊✨\n\n' +
        'Mi trabajo es ayudarte a crear y encontrar lobbies de **Ultra Street Fighter IV** 🍔\n\n' +
        'Con mis poderes de Kikosho puedo buscar partidas, ayudar a organizar combates y hacer que la pelea empiece más rápido 💨\n\n' +
        '🌱 Todavía estoy en entrenamiento, así que puede que cometa algún pequeño error uwu.\n\n' +
        'Gracias por ayudarme a mejorar 💕\n\n' +
        '🔥 ¡Que comiencen los combates!',
    );
  }
});


const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🍔 Chun-Burger está despierto y listo para luchar! 🥊");
});

app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
});
client.login(process.env.DISCORD_BOT_TOKEN);
