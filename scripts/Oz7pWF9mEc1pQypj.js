let roll = await new Roll("1d10").roll();
roll.toMessage({flavor : this.effect.name, speaker : {alias : this.actor.prototypeToken.name}})
this.actor.addCondition("stunned", roll.total)