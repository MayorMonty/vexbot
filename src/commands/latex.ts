/**
 * Displays latex when specified
 */

import Command, { Permissions } from "../lib/command";

export const LatexCommand = Command({
  names: ["latex", "math"],
  documentation: {
    description: "Outputs latex images from the given input",
    usage: "latex 4x^{2x}",
    group: "HELPER",
  },

  check: Permissions.all,
  async exec(message, args) {
    const equation = args.join(" ");
    const url = encodeURI(
      `https://latex.codecogs.com/png.latex?\\inline&space;\\dpi{300}&space;\\tiny&space;{\\color{White}&space;${equation}}`
    );

    return message.channel.send(url);
  },
});
