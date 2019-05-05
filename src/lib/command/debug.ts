import { addCommand } from "../message";
import { client } from "../../client";

import * as vexdb from "vexdb";
import keya from "keya";

const MAYORMONTY = "274004148276690944";

export function okay(message) {
  return message.author.id === MAYORMONTY;
}

addCommand("grant", (args, message) => {
  // Exclusive to myself
  if (!okay(message)) {
    return false;
  }

  const role = message.guild.roles.find(role => role.name === args.join(" "));
  message.member.addRole(role);
});

export let DEBUG = false;

addCommand("debug", (args, message) => {
  if (!okay(message)) {
    return false;
  }

  DEBUG = !DEBUG;

  message.channel.send(`Debug ${DEBUG ? "ENABLED" : "DISABLED"}`);
});

addCommand("cache", async (args, message) => {
  if (!okay(message)) {
    return false;
  }

  switch (args[0]) {
    case "clear":
      vexdb.cache.clear();
      message.channel.send(`Cache Cleared`);
      break;
    default:
      const store = await keya.store("vexdb");
      const cache = (await store.all()).map(v => v.value);
      message.channel.send(["VexDB Current Cache", ...cache].join("\n"));
  }
});

process.stderr.on("data", async chunk => {
  if (DEBUG) {
    let channel = await client.users.get(MAYORMONTY).createDM();

    channel.send(chunk.toString());
  }
});
