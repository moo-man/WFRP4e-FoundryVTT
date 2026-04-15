if (!this.item.equipped.value) {
  return this.script.notification(`You must equip the ${this.item.name} to restore Wounds.`,"info")
}

const runesOfRestoration = this.item.effects.contents.filter(e => e.name == this.effect.name)
const restorationWounds = parseInt(runesOfRestoration.length * this.actor.system.characteristics.t.bonus)

this.actor.modifyWounds(restorationWounds)
this.script.message(`You have restored ${restorationWounds} Wounds with ${this.script.label}.`)