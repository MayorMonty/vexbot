import { addMessageHandler } from "../lib/message";
import { client } from "../client";

import { PREFIX, isCommand } from "../lib/command";
import { DEBUG } from "../commands/debug";
import { code } from "../lib/util";

/**
 * Random behaviors
 */

addMessageHandler(message => {
  if (!message.mentions.users.has(client.user.id)) return false;

  const ping = client.emojis.find(emoji => emoji.name === "ping");
  message.react(ping);
});

// Rename #regret to something random
addMessageHandler(async message => {
  if (!isCommand(message)) return false;

  if (!message.guild) return false;
  if (message.guild.id != "310820885240217600") return false;

  const ID = "546890655398625286";
  const names = [
    "jennas-boyfriend",
    "regret",
    "bradleys-gay",
    "tylerbad",
    "thanos-cube",
    "gaytanoman",
    "zach-for-head-ref",
    "create-some-ass",
    "bradley-for-head-ref",
    "leeanna-for-emcee",
    "leeanna-for-head-ref",
    "serious-chat",
    "drow-for-gdc",
    "sadie",
    "bradleys-snoring",
    "admin-chat",
    "zach-for-gdc",
    "important-studying-chat"
  ];

  const channel = await message.guild.channels.find(
    channel => channel.id === ID
  );

  const name = names[Math.round(Math.random() * (names.length - 1))];
  channel.setName(name);

  return false;
});

addMessageHandler(message => {
  if (!DEBUG || message.channel.id !== "463891502473543690") {
    return false;
  }

  message.channel.send(code(message.content));
  return true;
});
