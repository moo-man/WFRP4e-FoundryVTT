let roll = (await new Roll("1d10").roll())
roll.toMessage({flavor: "Wounds Healed", speaker : {alias : this.actor.name}})

this.actor.modifyWounds(roll.total)

this.actor.hasCondition("bleeding")?.delete();