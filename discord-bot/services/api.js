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

function requestRematch(duelId, discordId) {
  return api.post(`/users/duels/${duelId}/rematch`, { discordId });
}

function acceptRematch(duelId, discordId, requestId) {
  return api.post(`/users/duels/${duelId}/rematch/accept`, { discordId, requestId });
}

function rejectRematch(duelId, discordId, requestId) {
  return api.post(`/users/duels/${duelId}/rematch/reject`, { discordId, requestId });
}

module.exports = {
  acceptRematch,
  getLobby,
  rejectRematch,
  requestRematch,
  saveDuelResult,
  saveSteamProfile,
};
