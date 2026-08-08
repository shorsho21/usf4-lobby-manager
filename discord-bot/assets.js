const path = require('path');
const { AttachmentBuilder } = require('discord.js');

function banner(fileName) {
  return new AttachmentBuilder(path.join(__dirname, 'assets', 'banners', fileName));
}

function duelBanner() {
  return banner('duel-chun-li.png');
}

function lobbyBanner() {
  return banner('lobby-chun-li.png');
}

function resultBanner() {
  return banner('banner-chun-li.png');
}

module.exports = { duelBanner, lobbyBanner, resultBanner };
