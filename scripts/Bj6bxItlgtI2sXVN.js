let roll = await new Roll("1d10").roll({allowInteractive : false});
roll.toMessage(this.script.getChatData());
args.totalWoundLoss = Math.max(0, args.totalWoundLoss - roll.total)
args.modifiers.other.push({label: this.effect.name, value : -1 * roll.total})
this.effect.update({disabled : true})