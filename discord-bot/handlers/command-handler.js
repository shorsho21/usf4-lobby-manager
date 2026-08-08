const { handleAbout } = require('./commands/about');
const { handleDuel } = require('./commands/duel');
const { handleHelp } = require('./commands/help');
const { handleLobby } = require('./commands/lobby');
const { handleSetSteam } = require('./commands/set-steam');

const handlers = {
  about: handleAbout,
  duel: handleDuel,
  help: handleHelp,
  lobby: handleLobby,
  setsteam: handleSetSteam,
};

async function handleCommand(interaction, client) {
  const handler = handlers[interaction.commandName];
  if (handler) await handler(interaction, client);
}

module.exports = { handleCommand };
