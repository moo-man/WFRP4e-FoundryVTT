await this.actor.hasCondition("broken")?.delete();
await this.actor.hasCondition("fatigued")?.delete();

let healed = this.effect.getFlag("wfrp4e", "handOfGlory")?.roll || 0;
this.actor.modifyWounds(healed)
this.script.message(`Healed ${healed} Wounds`)