import * as keya from "keya";
import FileSystemStore from "keya/out/node/filesystem";
import { Guild, Collection, TextChannel, Message } from "discord.js";
import Command, { Permissions, makeEmbed } from "../lib/command";
import SQLiteStore from "keya/out/node/sqlite";
import { client } from "../client";
import { addMessageHandler } from "../lib/message";

async function fetchAll(channel: TextChannel) {
  let messages = await channel.fetchMessages({ limit: 100 });
  let pointer = messages.lastKey();
  let batch;

  process.stdout.write(" fetching");

  do {
    batch = (await channel.fetchMessages({
      limit: 100,
      before: pointer
    })).filter(message => !message.author.bot);

    pointer = batch.lastKey();
    messages = messages.concat(batch);

    process.stdout.write(".");
  } while (batch.size > 0);

  console.log("");

  return messages;
}

async function getTotals(store: SQLiteStore, guild: Guild) {
  const text = guild.channels.filter(
    channel => channel.type === "text"
  ) as Collection<string, TextChannel>;

  let totals = {};

  for (let [id, channel] of text) {
    console.log(`Tallying #${channel.name}...`);
    const messages = await fetchAll(channel);
    messages.forEach(message => {
      if (totals[message.author.id]) {
        totals[message.author.id]++;
      } else {
        totals[message.author.id] = 1;
      }
    });
    console.log(`Done! Got ${messages.size} messages`);
  }

  console.log(totals);

  // Set totals for everyone
  await Promise.all(
    Object.keys(totals).map(async id => store.set(id, totals[id]))
  );
}

(async function() {
  const store = await keya.store(`vexbotleaderboard`);

  class LeaderboardCommand extends Command("leaderboard") {
    check = Permissions.guild;

    documentation() {
      return {
        usage: "leaderboard",
        description: "Lists people by their number of messages posted",
        group: "META"
      };
    }

    titles = {
      "Secret Top Tier": "messages",
      "People With No Lives": "hours on VTOSC",
      "VEX Gods": "world championships",
      "Banhammer Incoming": "illegal messages",
      "IQ Scores": "points",
      "Programming Wizards": "pt autonomous",
      "Highest Build Quality": "halfcuts",
      "Best Head Refs": "dqs",
      "Poking the Beehive": "posts on VF",
      "Tournaments 'Won'": "bo1'd matches"
    };

    async exec(message: Message, args: string[]) {
      const all = await store.all();
      const top = all.sort((a, b) => b.value - a.value);

      const leaderboard = top
        .slice(0, +args[0] || 10)
        .map(v => client.users.get(v.key));

      const title = Object.keys(this.titles)[
        Math.round(Object.keys(this.titles).length * Math.random())
      ];

      const embed = makeEmbed(message)
        .setTitle(title)
        .setDescription(
          leaderboard
            .map(
              (k, i) => `${i + 1}. ${k} — ${top[i].value} ${this.titles[title]}`
            )
            .join("\n")
        );

      return message.channel.send(embed);
    }
  }

  const leaderboard = new LeaderboardCommand();

  class LeaderboardTallyCommand extends Command("tally") {
    check = Permissions.admin;

    documentation() {
      return {
        description: "Tallies the leaderboard",
        usage: "tally",
        group: "META"
      };
    }

    async exec(message: Message) {
      await message.channel.send("Recalculating totals...");
      await getTotals(store, message.guild);

      const reply = (await message.reply("Done!")) as Message;
      leaderboard.exec(reply, ["10"]);

      return reply;
    }
  }

  new LeaderboardTallyCommand();

  // Increment messages
  addMessageHandler(async message => {
    const value = (await store.get(message.author.id)) || 0;
    await store.set(message.author.id, value + 1);
    return false;
  });
})();
