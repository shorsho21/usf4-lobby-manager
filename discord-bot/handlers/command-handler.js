const { handleAbout } = require('./commands/about');
const { handleDuel } = require('./commands/duel');
const { handleHelp } = require('./commands/help');
const { handleLobby } = require('./commands/lobby');
const { handleSetSteam } = require('./commands/set-steam');
const { handleProfile } = require('./commands/profile');
const { handleChun } = require('./commands/chun');

const handlers = {
  about: handleAbout,
  duel: handleDuel,
  help: handleHelp,
  lobby: handleLobby,
  setsteam: handleSetSteam,
  profile: handleProfile,
  chun: handleChun,
};

async function handleCommand(interaction, client) {
  const handler = handlers[interaction.commandName];
  if (handler) await handler(interaction, client);
}


module.exports = { handleCommand };
