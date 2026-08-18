const { askChun } = require('../../services/api');

async function handleChun(interaction) {
  await interaction.deferReply();

  const mensaje = interaction.options.getString('mensaje');

  try {
    const response = await askChun(mensaje);

    if (response.data && response.data.success && response.data.content) {
      let content = response.data.content;
      // Discord message max length is 2000 characters
      if (content.length > 2000) {
        content = content.slice(0, 1997) + '...';
      }
      await interaction.editReply(content);
      return;
    }

    await interaction.editReply(
      '🍔💨 ¡Ups! En este momento no pude pensar una respuesta... Intenta preguntarme de nuevo en unos momentos 🥺🥊',
    );
  } catch (error) {
    console.error('Error en comando /chun:', error.response?.data || error.message);
    await interaction.editReply(
      '🍔💨 ¡Ups! En este momento no pude conectarme con mis pensamientos. ¡Intenta de nuevo más tarde! 🥺🥊',
    );
  }
}

module.exports = { handleChun };
