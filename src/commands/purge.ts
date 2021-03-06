import Command, { Permissions } from "../lib/command";
import { Message, TextChannel } from "discord.js";

/**
 * Purges messages in the used channel
 */

export const PurgeCommand = Command({
  names: ["purge"],
  documentation: {
    group: "ADMIN",
    description: "Purges messages from a user, channel or role",
    usage: "purge <number of messages> @USER @ROLE #CHANNEL",
  },

  check: Permissions.admin,
  async exec(message: Message, [count]: string[]) {
    if (!message.mentions.members) {
      return;
    }

    let channel: TextChannel;

    // What do we need to clear
    const filters = {
      member: message.mentions.members.first(),
      channel: message.mentions.channels.first(),
      role: message.mentions.roles.first(),
    };

    if (filters.channel instanceof TextChannel) {
      channel = filters.channel;
    } else {
      channel = message.channel as TextChannel;
    }

    // Get recent messages
    let messages = await channel.messages.fetch({
      before: message.id,
      limit: 100,
    });

    // Run Filters
    if (filters.member) {
      messages = messages.filter(
        (message) =>
          message.member === null || message.member.id != filters.member?.id
      );
    }

    if (filters.role) {
      messages = messages.filter(
        (message) =>
          message.member === null ||
          (filters.role !== undefined &&
            message.member.roles.cache.has(filters.role.id))
      );
    }

    // Purge messages
    await Promise.all(
      messages
        .array()
        .slice(0, +count)
        .map((message) => message.delete())
    );

    return message.channel.send(`Deleted ${count} messages from ${channel}`);
  },
});
