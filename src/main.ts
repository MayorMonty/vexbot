import discord from "discord.js";
import { handleMessage } from "./lib/message";
import report from "./lib/report";
import { client } from "./client";

import "./lib/handlers";
import "./commands";

client.on("ready", () => {
  console.log("vexbot#0599 is online!");

  if (process.env["DEV"]) {
    client.user.setActivity("with VSCode", { type: "PLAYING" });
  } else {
    client.user.setActivity("over the server", { type: "WATCHING" });
  }
});

const reporter = report(client);
process.on("uncaughtException", reporter);
process.on("unhandledRejection", reporter);

client.on("message", handleMessage);
client.on("error", report);
