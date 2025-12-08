if (this.item.flags.runeOfIron) return


const runesOfIron = this.item.effects.contents.filter(e => e.name == this.effect.name)
const ironWounds = parseInt(runesOfIron.length * 2)
const currentWounds = this.actor.system.status.wounds.value

if (args.equipped) {
  this.item.flags.runeOfIron = true
  this.actor.modifyWounds(ironWounds)
}
else
{
  this.item.flags.runeOfIron = true
  this.actor.modifyWounds(-ironWounds)
  if (ironWounds > currentWounds) {
    this.script.message(`You have removed ${ironWounds} Wounds by unequipping Runic Armoour, but you only had ${currentWounds} Wounds remaining. This may trigger a critical injury.`)
  }
}