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
} = require('discord.js');
const axios = require('axios');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    // Registro global de comandos
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
     MANEJO DE INTERACCIONES (SLASH)
  ====================================
*/
client.on(Events.InteractionCreate, async (interaction) => {
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
      await interaction.reply({
        content: '❌🍔 No pude guardar tu perfil de Steam. Intenta nuevamente.',
        ephemeral: true,
      });
    }
    return;
  }

  /*
    ====================================
              COMANDO LOBBY
    ====================================
  */
  if (commandName === 'lobby') {
    // Deducimos respuesta mientras consultamos la API
    await interaction.deferReply();

    try {
      const response = await axios.get(
        `${process.env.API_URL}/steam/lobby/${interaction.user.id}`,
      );

      if (!response.data.success) {
        await interaction.editReply(
          `🍔💨 ¡Kikosho fallido... 🥺!\n\n` +
            `🥺 No pude encontrar tu hamburguesa... quiero decir tu lobby:\n` +
            `🌱 Abre tu sala de ${response.data.gameextrainfo} y volveré a buscarla por ti, luchador. 🥊`,
        );
        return;
      }

      const steamLink = response.data.joinLink;

      const embed = new EmbedBuilder()
        .setTitle(
          '🥊 Lobby ' + response.data.game ||
            response.data.gameextrainfo + ' activo',
        )
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
            value: response.data.game || response.data.gameextrainfo,
            inline: true,
          },
          { name: '🟢 Estado', value: 'Lobby activo', inline: true },
        )
        .setFooter({
          text: 'Chun Burger bot • ' + response.data.gameextrainfo,
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

      const embed = new EmbedBuilder()

        .setColor(0xdc2626)

        .setTitle('🥊 CHUN-BURGER CHALLENGE')

        .setDescription(
          `# ${interaction.user.username} 🆚 ${opponent.username}\n\n` +
            `🥋 ${interaction.user} desafía a ${opponent}\n\n` +
            `🏆 FT${ft}`,
        )

        .addFields({
          name: '🔗 Steam Lobby',
          value: `\`\`\`\n${steamLink}\n\`\`\``,
        });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()

          .setCustomId(`duel_winner_${interaction.user.id}_${opponent.id}`)

          .setLabel(`🏆 ${interaction.user.username}`)

          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()

          .setCustomId(`duel_winner_${opponent.id}_${interaction.user.id}`)

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
  }
  if (interaction.isButton()) {
    if (!interaction.customId.startsWith('duel_winner_')) {
      return;
    }

    const data = interaction.customId.split('_');

    const winnerId = data[2];
    const loserId = data[3];

    const winner = await client.users.fetch(winnerId);
    const loser = await client.users.fetch(loserId);

    // Deshabilitar botones
    const row = ActionRowBuilder.from(interaction.message.components[0]);

    row.components.forEach((button) => button.setDisabled(true));

    await interaction.update({
      components: [row],
    });

    await interaction.followUp({
      embeds: [
        new EmbedBuilder()

          .setColor(0x22c55e)

          .setTitle('🏆 DUEL FINALIZADO')

          .setDescription(
            `🥇 ${winner} ganó el FT.\n\n` +
              `👏 ¡Felicitaciones!\n\n` +
              `GG ${loser} 🍔`,
          )

          .setThumbnail(
            winner.displayAvatarURL({
              size: 512,
            }),
          )

          .setTimestamp(),
      ],
    });
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
