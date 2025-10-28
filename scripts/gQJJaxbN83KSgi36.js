if (!args.totalWoundLoss) return

const roll = await new Roll("2d10").roll();
roll.toMessage(this.script.getChatData());

args.attacker.applyBasicDamage(Number(roll.total), { loc: "roll" })