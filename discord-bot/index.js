require('dotenv').config();

const express = require('express');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

/*
  ====================================
      DEFINICIÓN DE SLASH COMMANDS
  ====================================
*/
const commands = [
  new SlashCommandBuilder()
    .setName('setsteam')
    .setDescription('Guarda tu perfil de Steam en Chun-Burger')
    .addStringOption((option) =>
      option
        .setName('steam_profile')
        .setDescription('Tu enlace o ID de perfil de Steam')
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName('lobby')
    .setDescription('Busca tu lobby activo de Steam'),

  new SlashCommandBuilder()
    .setName('duel')
    .setDescription('Reta a otro jugador a una serie FT (First To X)')
    .addUserOption((option) =>
      option
        .setName('jugador')
        .setDescription('El jugador al que deseas retar')
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('ft')
        .setDescription('Formato de la serie (ej: 3 para FT3)')
        .setRequired(true)
        .setMinValue(1),
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra la lista de comandos disponibles'),

  new SlashCommandBuilder()
    .setName('about')
    .setDescription('Información sobre Chun-Burger Bot'),
].map((cmd) => cmd.toJSON());

/*
  ====================================
        REGISTRO Y READY EVENT
  ====================================
*/
client.once(Events.ClientReady, async () => {
  console.log(`Bot conectado como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(
    process.env.DISCORD_BOT_TOKEN,
  );

  try {
    console.log('Registrando Slash Commands...');
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log('¡Slash Commands registrados correctamente!');
  } catch (error) {
    console.error('Error al registrar Slash Commands:', error);
  }
});

/*
  ====================================
     MANEJO DE INTERACCIONES
  ====================================
*/
client.on(Events.InteractionCreate, async (interaction) => {
  /*
    ------------------------------------
          MANEJO DE BOTONES
    ------------------------------------
  */
  if (interaction.isButton()) {
    if (!interaction.customId.startsWith('dw:')) return;

    const [
      ,
      challengerDiscordId,
      opponentDiscordId,
      winnerDiscordId,
      ft,
      encodedGame,
    ] = interaction.customId.split(':');

    const game = decodeURIComponent(encodedGame);

    const duelResultPayload = {
      challenger_discord_id: challengerDiscordId,
      opponent_discord_id: opponentDiscordId,
      winner_discord_id: winnerDiscordId,
      ft: parseInt(ft, 10),
      game: game,
    };

    try {
      const winner = await client.users.fetch(winnerDiscordId);
      const loserId =
        winnerDiscordId === challengerDiscordId
          ? opponentDiscordId
          : challengerDiscordId;
      const loser = await client.users.fetch(loserId);

      // Deshabilitar los botones inmediatamente para evitar múltiples clics
      const row = ActionRowBuilder.from(interaction.message.components[0]);
      row.components.forEach((button) => button.setDisabled(true));

      await interaction.update({
        components: [row],
      });

      // Guardar el registro en Supabase a través del endpoint /users/duels
      try {
        await axios.post(
          `${process.env.API_URL}/users/duels`,
          duelResultPayload,
        );
      } catch (dbError) {
        console.error(
          'Error al guardar el duelo en la API/BD:',
          dbError.response?.data || dbError.message,
        );
      }

      // Notificar el resultado en Discord
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
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
            .addFields(
              {
                name: '🏆 Ganador',
                value: `${winner}`,
                inline: true,
              },
              {
                name: '💀 Derrotado',
                value: `${loser}`,
                inline: true,
              },
              {
                name: '⚔️ Resultado',
                value: `FT${ft}`,
                inline: true,
              },
            )
            .setFooter({
              text: '🍔 Chun-Burger Challenge • GGWP',
              iconURL: winner.displayAvatarURL({ size: 128 }),
            })
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error('Error procesando el resultado del duelo:', error);
    }
    return;
  }

  /*
    ------------------------------------
       MANEJO DE SLASH COMMANDS
    ------------------------------------
  */
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  /*
    ====================================
            COMANDO SETSTEAM
    ====================================
  */
  if (commandName === 'setsteam') {
    const steamProfile = interaction.options.getString('steam_profile');

    try {
      const response = await axios.post(`${process.env.API_URL}/users`, {
        discordId: interaction.user.id,
        username: interaction.user.username,
        steamProfile: steamProfile,
      });

      if (response.data.success) {
        await interaction.reply(
          `🍔🌸 ¡Listo luchador! Guardé tu perfil de Steam.\n\n` +
            `🎮 ${steamProfile}\n\n` +
            `Ahora Chun-Burger podrá encontrar tus lobbies cuando quieras 🥊✨`,
        );
      } else {
        await interaction.reply({
          content:
            '❌🍔 No pude guardar tu perfil de Steam. Intenta nuevamente.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      if (!interaction.replied) {
        await interaction.reply({
          content:
            '❌🍔 No pude guardar tu perfil de Steam. Intenta nuevamente.',
          ephemeral: true,
        });
      }
    }
    return;
  }

  /*
    ====================================
              COMANDO LOBBY
    ====================================
  */
  if (commandName === 'lobby') {
    await interaction.deferReply();

    try {
      const response = await axios.get(
        `${process.env.API_URL}/steam/lobby/${interaction.user.id}`,
      );

      const gameName =
        response.data.game || response.data.gameextrainfo || 'Juego';

      if (!response.data.success) {
        await interaction.editReply(
          `🍔💨 ¡Kikosho fallido... 🥺!\n\n` +
            `🥺 No pude encontrar tu hamburguesa... quiero decir tu lobby:\n` +
            `🌱 Abre tu sala de **${gameName}** y volveré a buscarla por ti, luchador. 🥊`,
        );
        return;
      }

      const steamLink = response.data.joinLink;

      const embed = new EmbedBuilder()
        .setTitle(`🥊 Lobby de ${gameName} activo`)
        .setDescription(
          'Un nuevo lobby está disponible.\n\n' +
            '🎮 **Link de conexión:**\n' +
            `\`\`\`\n${steamLink}\n\`\`\``,
        )
        .setAuthor({
          name: `${interaction.user.username} creó el lobby`,
          iconURL: interaction.user.displayAvatarURL({ size: 256 }),
        })
        .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
        .addFields(
          {
            name: '👤 Jugador',
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: '🎮 Juego',
            value: gameName,
            inline: true,
          },
          { name: '🟢 Estado', value: 'Lobby activo', inline: true },
        )
        .setFooter({
          text: `Chun Burger bot • ${gameName}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error.response?.data || error.message);
      await interaction.editReply('❌ Error comunicándose con la API.');
    }
    return;
  }

  /*
    ====================================
              COMANDO DUEL
    ====================================
  */
  if (commandName === 'duel') {
    const opponent = interaction.options.getUser('jugador');
    const ft = interaction.options.getInteger('ft');

    if (opponent.id === interaction.user.id) {
      await interaction.reply({
        content: '😂 No puedes retarte a ti mismo.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const response = await axios.get(
        `${process.env.API_URL}/steam/lobby/${interaction.user.id}`,
      );

      if (!response.data.success) {
        await interaction.editReply('❌ No tienes un lobby activo.');
        return;
      }

      const steamLink = response.data.joinLink;
      const game =
        response.data.game ||
        response.data.gameextrainfo ||
        'Juego desconocido';

      const embed = new EmbedBuilder()

        .setColor(0xdc2626)

        .setTitle('⚔️ CHUN-BURGER MATCH')

        .setDescription(
          `# 🥊 ${interaction.user.username}  🆚  ${opponent.username}\n\n` +
            `> **"${interaction.user.username}" ha lanzado un desafío.**\n\n` +
            `🔥 **First To:** FT${ft}\n` +
            `🎮 **Juego:** ${game}\n` +
            `📡 **Estado:** 🟢 Lobby disponible`,
        )

        .setAuthor({
          name: '🍔 Chun-Burger Matchmaking',
          iconURL: client.user.displayAvatarURL(),
        })

        .setThumbnail(
          interaction.user.displayAvatarURL({
            size: 512,
          }),
        )

        .addFields(
          {
            name: '🥊 Retador',
            value: `${interaction.user}\n` + '🟢 Preparado',
            inline: true,
          },
          {
            name: '🎯 Retado',
            value: `${opponent}\n` + '⚔️ Esperando respuesta',
            inline: true,
          },
          {
            name: '━━━━━━━━━━━━━━━━━━',
            value: '### 🔗 Steam Lobby\n' + `\`\`\`\n${steamLink}\n\`\`\``,
          },
        )

        .setFooter({
          text: '🍔 Ready? Fight!',
          iconURL: client.user.displayAvatarURL(),
        })

        .setTimestamp();
      const encodedGame = encodeURIComponent(game);

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(
            `dw:${interaction.user.id}:${opponent.id}:${interaction.user.id}:${ft}:${encodedGame}`,
          )
          .setLabel(`🏆 ${interaction.user.username}`)
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(
            `dw:${interaction.user.id}:${opponent.id}:${opponent.id}:${ft}:${encodedGame}`,
          )
          .setLabel(`🏆 ${opponent.username}`)
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.editReply({
        embeds: [embed],
        components: [buttons],
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Error al crear el duelo.');
    }
    return;
  }

  /*
    ====================================
              COMANDO HELP
    ====================================
  */
  if (commandName === 'help') {
    await interaction.reply(
      '🍔🌸 **Chun-Burger Command List** 🥊\n\n' +
        '✨ ¡Konnichiwa, luchador! Estos son mis movimientos especiales:\n\n' +
        '🥋 `/setsteam <steam_profile>`\n' +
        '→ Guarda tu Steam para poder ayudarte a encontrar partidas.\n\n' +
        '💨 `/lobby`\n' +
        '→ Busco tu lobby de tus juegos favoritos con mi poder de Kikosho.\n\n' +
        '🥊 `/duel <jugador> <ft>`\n' +
        '→ Desafía a un jugador a una serie First To X.\n\n' +
        '📖 `/help`\n' +
        '→ Te muestro todos mis comandos disponibles.\n\n' +
        '🍔 `/about`\n' +
        '→ Te cuento quién soy y por qué estoy aquí.\n\n' +
        '🌟 ¡Buena suerte en tus combates, luchador!',
    );
    return;
  }

  /*
    ====================================
              COMANDO ABOUT
    ====================================
  */
  if (commandName === 'about') {
    await interaction.reply(
      '🍔 **Chun-Burger Bot**\n\n' +
        '🌸 ¡Konnichiwa, luchador! Soy Chun-Burger 🥊✨\n\n' +
        'Mi trabajo es ayudarte a crear y encontrar lobbies de tus juegos favoritos 🍔\n\n' +
        'Con mis poderes de Kikosho puedo buscar partidas, ayudar a organizar combates y hacer que la pelea empiece más rápido 💨\n\n' +
        '🌱 Todavía estoy en entrenamiento, así que puede que cometa algún pequeño error uwu.\n\n' +
        'Gracias por ayudarme a mejorar 💕\n\n' +
        '🔥 ¡Que comiencen los combates!',
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
