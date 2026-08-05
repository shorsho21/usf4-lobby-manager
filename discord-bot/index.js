require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Evento de inicio corregido (Events.ClientReady o 'ready')
client.once(Events.ClientReady, () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignorar bots y mensajes que no empiecen con '/'
  if (message.author.bot || !message.content.startsWith('/')) return;

  // Separar el comando y sus argumentos
  const args = message.content.slice(1).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  /*
    ====================================
            COMANDO SETSTEAM
    ====================================
  */
  if (command === 'setsteam') {
    const steamProfile = args[0];

    if (!steamProfile) {
      await message.reply('❌ Uso correcto: `/setsteam <steam_profile>`');
      return;
    }

    try {
      const response = await axios.post(`${process.env.API_URL}/users`, {
        discordId: message.author.id,
        username: message.author.username,
        steamProfile: steamProfile,
      });

      if (response.data.success) {
        await message.reply(
          `🍔🌸 ¡Listo luchador! Guardé tu perfil de Steam.\n\n` +
            `🎮 ${steamProfile}\n\n` +
            `Ahora Chun-Burger podrá encontrar tus lobbies cuando quieras 🥊✨`
        );
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      await message.reply('❌🍔 No pude guardar tu perfil de Steam. Intenta nuevamente.');
    }
    return;
  }

  /*
    ====================================
              COMANDO LOBBY
    ====================================
  */
  if (command === 'lobby') {
    try {
      await message.reply('🍔 Voy a buscar tu hamburguesa... digo, tu lobby 😋');

      const response = await axios.get(`${process.env.API_URL}/steam/lobby/${message.author.id}`);

      if (!response.data.success) {
        await message.reply(
          `🍔💨 ¡Kikosho fallido... 🥺!\n\n` +
            `🥺 No pude encontrar tu hamburguesa... quiero decir tu lobby:\n` +
            `${response.data.message}\n\n` +
            `🌱 Abre tu sala de **Ultra Street Fighter IV** y volveré a buscarla por ti, luchador. 🥊`
        );
        return;
      }

      const steamLink = response.data.joinLink;

      const embed = new EmbedBuilder()
        .setTitle('🥊 Lobby de Ultra Street Fighter IV')
        .setDescription(
          'Un nuevo lobby está disponible.\n\n' +
            '🎮 **Link de conexión:**\n' +
            `\`\`\`\n${steamLink}\n\`\`\``
        )
        .setAuthor({
          name: `${message.author.username} creó el lobby`,
          iconURL: message.author.displayAvatarURL({ size: 256 }),
        })
        .setThumbnail(message.author.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '👤 Jugador', value: `<@${message.author.id}>`, inline: true },
          { name: '🎮 Juego', value: response.data.game || 'Ultra Street Fighter IV', inline: true },
          { name: '🟢 Estado', value: 'Lobby activo', inline: true }
        )
        .setFooter({
          text: 'SF4 Tournament Bot • Ultra Street Fighter IV',
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error.response?.data || error.message);
      await message.reply('❌ Error comunicándose con la API.');
    }
    return;
  }

  /*
    ====================================
              COMANDO DUEL
    ====================================
  */
  if (command === 'duel') {
    const opponent = message.mentions.users.first();
    const ft = args[1];

    if (!opponent || !ft || isNaN(ft)) {
      await message.reply('❌ Uso correcto: `/duel @jugador <FT>` (ejemplo: `/duel @Luchador 5`)');
      return;
    }

    try {
      const response = await axios.get(`${process.env.API_URL}/steam/lobby/${message.author.id}`);

      if (!response.data.success) {
        await message.reply(`❌ No se pudo crear el desafío porque no tienes un lobby activo en Steam.`);
        return;
      }

      const steamLink = response.data.joinLink;

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🥊 Nuevo desafío')
        .setDescription(
          `${message.author} desafía a ${opponent} a un **FT${ft}**.\n\n` +
            `🎮 **Lobby:**\n` +
            `\`\`\`\n${steamLink}\n\`\`\``
        )
        .setAuthor({
          name: `${message.author.username} inició un desafío`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
          { name: '🥊 Retador', value: `${message.author}`, inline: true },
          { name: '🎯 Retado', value: `${opponent}`, inline: true },
          { name: '🏆 Formato', value: `FT${ft}`, inline: true },
          { name: '🎮 Juego', value: response.data.game || 'Ultra Street Fighter IV', inline: true },
          { name: '🟢 Estado', value: 'Esperando aceptación', inline: true }
        )
        .setFooter({
          text: 'Chun-Burger Bot 🍔',
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error.response?.data || error.message);
      await message.reply('❌ Error al procesar el desafío o comunicar con la API.');
    }
    return;
  }

  /*
    ====================================
              COMANDO HELP
    ====================================
  */
  if (command === 'help') {
    await message.reply(
      '🍔🌸 **Chun-Burger Command List** 🥊\n\n' +
        '✨ ¡Konnichiwa, luchador! Estos son mis movimientos especiales:\n\n' +
        '🥋 `/setsteam <link_de_steam>`\n' +
        '→ Guarda tu Steam para poder ayudarte a encontrar partidas.\n\n' +
        '💨 `/lobby`\n' +
        '→ Busco tu lobby de Ultra Street Fighter IV con mi poder de Kikosho.\n\n' +
        '🥊 `/duel @jugador <FT>`\n' +
        '→ Desafía a un jugador a una serie First To X.\n\n' +
        '📖 `/help`\n' +
        '→ Te muestro todos mis comandos disponibles.\n\n' +
        '🍔 `/about`\n' +
        '→ Te cuento quién soy y por qué estoy aquí.\n\n' +
        '🌟 ¡Buena suerte en tus combates, luchador!'
    );
    return;
  }

  /*
    ====================================
              COMANDO ABOUT
    ====================================
  */
  if (command === 'about') {
    await message.reply(
      '🍔 **Chun-Burger Bot**\n\n' +
        '🌸 ¡Konnichiwa, luchador! Soy Chun-Burger 🥊✨\n\n' +
        'Mi trabajo es ayudarte a crear y encontrar lobbies de **Ultra Street Fighter IV** 🍔\n\n' +
        'Con mis poderes de Kikosho puedo buscar partidas, ayudar a organizar combates y hacer que la pelea empiece más rápido 💨\n\n' +
        '🌱 Todavía estoy en entrenamiento, así que puede que cometa algún pequeño error uwu.\n\n' +
        'Gracias por ayudarme a mejorar 💕\n\n' +
        '🔥 ¡Que comiencen los combates!'
    );
    return;
  }
});

/*
  ====================================
          SERVIDOR EXPRESS
  ====================================
*/
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🍔 Chun-Burger está despierto y listo para luchar! 🥊');
});

app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);