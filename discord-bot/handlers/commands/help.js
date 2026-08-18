async function handleHelp(interaction) {
  await interaction.reply(
    '🍔🌸 **Chun-Burger Command List** 🥊\n\n' +
      '✨ ¡Konnichiwa, luchador! Estos son mis movimientos especiales:\n\n' +
      '🥋 `/setsteam <steam_profile>`\n' +
      '→ Guarda tu Steam para poder ayudarte a encontrar partidas.\n\n' +
      '👤 `/profile [usuario]`\n' +
      '→ Muestra tu perfil de Chun-Burger o el de otro jugador.\n\n' +
      '💨 `/lobby`\n' +
      '→ Busco tu lobby de tus juegos favoritos con mi poder de Kikosho.\n\n' +
      '🥊 `/duel <jugador> <ft>`\n' +
      '→ Desafía a un jugador a una serie First To X.\n\n' +
      '🤖 `/chun <mensaje>`\n' +
      '→ Charla conmigo y te responderé con toda mi energía.\n\n' +
      '📖 `/help`\n' +
      '→ Te muestro todos mis comandos disponibles.\n\n' +
      '🍔 `/about`\n' +
      '→ Te cuento quién soy y por qué estoy aquí.\n\n' +
      '🌟 ¡Buena suerte en tus combates, luchador!',
  );
}


module.exports = { handleHelp };
