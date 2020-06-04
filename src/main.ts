import { handleMessage } from "./lib/message";
import report, { information } from "./lib/report";
import { client } from "./client";

import { DEBUG } from "./commands/debug";

import "./lib/handlers";

// Behaviors
import "./behaviors/log";
import "./behaviors/random";
import "./behaviors/eliza";
import "./behaviors/restart";
import "./behaviors/elo";
import "./behaviors/nickname";
import * as probation from "./behaviors/probation";

// Commands and message handlers

import "./commands";

client.on("ready", () => {
  console.log("vexbot#0599 is online!");

  if (!client.user) {
    console.error("Could not access client user");
    process.exit(1);
  }

  if (process.env["DEV"]) {
    console.log("DEV MODE ENABLED");
    client.user.setActivity("for changes", { type: "WATCHING" });
  } else {
    client.user.setActivity("joincampaignzero.org", { type: "CUSTOM_STATUS" });
  }

  probation.initalize();

  if (DEBUG || !process.env["DEV"]) {
    information(client)(
      `${process.env["DEV"] ? "DEV MODE" : "PRODUCTION"} online!`
    );
  }
});

const reporter = report(client);
process.on("uncaughtException", (e) => (DEBUG ? reporter(e) : null));
process.on("unhandledRejection", (e) => (DEBUG ? reporter(e) : null));

client.on("message", handleMessage);
