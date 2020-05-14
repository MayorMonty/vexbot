import * as keya from "keya";
import { client } from "../client";
import { GuildMember, Guild } from "discord.js";

// @ts-ignore
import parse from "parse-duration";
import report from "../lib/report";

export let TIMEOUTS: { [key: string]: NodeJS.Timeout } = {};

export async function initalize() {
  const store = await keya.store("vexbotprobations");

  // Get all active probations (covers for bot shutdowns), note shutdown parameters looks like { start: timestamp, end: timestamp, reason: string }
  const probations = await store.all();

  console.log(`Restoring ${probations.length} probations...`);

  for (let probation of probations) {
    const { start, end, reason, guild } = probation.value as {
      start: number;
      end: number;
      reason: string;
      guild: string;
    };

    TIMEOUTS[`${guild}:${probation.key}`] = setTimeout(
      free(probation.key, guild),
      end - Date.now()
    );
  }
}

export const free = (memberid: string, guildid: string) => async () => {
  const guild = client.guilds.resolve(guildid) as Guild;
  const member = guild.members.resolve(memberid) as GuildMember;
  const probation = guild.roles.resolve("Probation");

  if (!probation) {
    report(client)(
      new Error(
        `Could not probate user in ${member.guild.name}, no probation role found`
      )
    );
    return;
  }

  console.log(`Free ${member}`);

  const store = await keya.store("vexbotprobations");

  await member.roles.remove(probation);
  const dm = await member.createDM();

  dm.send(
    "Your probation has been lifted! You are now permitted to post again. Please remember, repeat offences will be more likely to lead to a ban."
  );

  store.delete(member.id);

  clearTimeout(TIMEOUTS[`${guild.id}:${member.id}`]);
  delete TIMEOUTS[`${guild.id}:${member.id}`];
};

export default async function probate(
  member: GuildMember,
  by: GuildMember | null,
  time: string,
  reason: string
) {
  console.log(
    `Probate ${member} by ${by} for ${parse(time)}ms with reason ${reason}`
  );

  // Create record in keya
  const store = await keya.store("vexbotprobations");
  const end = Date.now() + parse(time);

  await store.set(member.id, {
    start: Date.now(),
    end,
    reason,
    guild: member.guild.id,
  });

  // Set up timeout
  TIMEOUTS[`${member.guild.id}:${member.id}`] = setTimeout(
    free(member.id, member.guild.id),
    parse(time)
  );

  // Actually do the probation
  const probation = member.guild.roles.resolve("Probation");

  if (!probation) {
    report(client)(
      new Error(
        `Could not probate user in ${member.guild.name}, no probation role found`
      )
    );
    return;
  }

  await member.roles.add(
    probation,
    `For ${time} by ${by === null ? "system" : by.nickname}; Reason: ${reason}`
  );

  // Slide into DMs to give warning
  const dm = await member.createDM();
  const appeals = member.guild.channels.cache.find(
    (channel) => channel.name === "appeals"
  );
  dm.send(
    `You've been put on probation by ${by} for ${time} with the following reason: ${reason}. While you are on probation, you cannot post or speak in any channel. If you believe this is in error, you can communicate with Admins in ${appeals}`
  );
}
