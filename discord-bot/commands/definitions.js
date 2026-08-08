const { SlashCommandBuilder } = require('discord.js');

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
].map((command) => command.toJSON());

module.exports = { commands };
