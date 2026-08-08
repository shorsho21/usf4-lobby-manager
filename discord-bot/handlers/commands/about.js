async function handleAbout(interaction) {
  await interaction.reply(
    '🍔 **Chun-Burger Bot**\n\n' +
      '🌸 ¡Konnichiwa, luchador! Soy Chun-Burger 🥊✨\n\n' +
      'Mi trabajo es ayudarte a crear y encontrar lobbies de tus juegos favoritos 🍔\n\n' +
      'Con mis poderes de Kikosho puedo buscar partidas, ayudar a organizar combates y hacer que la pelea empiece más rápido 💨\n\n' +
      '🌱 Todavía estoy en entrenamiento, así que puede que cometa algún pequeño error uwu.\n\n' +
      'Gracias por ayudarme a mejorar 💕\n\n' +
      '🔥 ¡Que comiencen los combates!',
  );
}

module.exports = { handleAbout };
