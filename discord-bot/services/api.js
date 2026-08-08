const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_URL,
});

function saveSteamProfile({ discordId, username, steamProfile }) {
  return api.post('/users', { discordId, username, steamProfile });
}

function getLobby(discordId) {
  return api.get(`/steam/lobby/${discordId}`);
}

function saveDuelResult(payload) {
  return api.post('/users/duels', payload);
}

module.exports = { getLobby, saveDuelResult, saveSteamProfile };
