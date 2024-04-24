let healed = args.totalWoundLoss

this.script.scriptMessage(`<b>this.actor.prototypeToken.name</b> healed ${healed} Wounds`);

this.actor.modifyWounds(healed)