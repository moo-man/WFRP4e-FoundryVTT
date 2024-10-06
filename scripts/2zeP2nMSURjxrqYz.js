let wounds = this.actor.system.status.wounds
if (wounds.value == 0)
  return this.script.notification("No effect at 0 Wounds", "error")

this.script.notification(`Healed ${this.actor.characteristics.t.bonus} Wounds`)
await this.actor.modifyWounds(this.actor.characteristics.t.bonus)