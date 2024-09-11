let healed = args.totalWoundLoss

this.script.message(`<b>this.actor.prototypeToken.name</b> healed ${healed} Wounds`);

this.actor.modifyWounds(healed)