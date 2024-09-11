await this.actor.modifyWounds(this.actor.system.characteristics.t.bonus * 3)
this.script.message(`Heals ${this.actor.system.characteristics.t.bonus * 3} Wounds`)

this.actor.hasCondition("bleeding")?.delete()
this.actor.hasCondition("fatigued")?.delete()
