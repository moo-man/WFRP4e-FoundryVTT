if (this.item.flags.runeOfLuck || this.actor.type != "character") return

const currentFortune = this.actor.status.fortune.value
const runesOfLuck = this.item.effects.contents.filter(e => e.name == this.effect.name)
const runeFortune = parseInt(runesOfLuck.length)

if (args.equipped) {
  this.item.flags.runeOfLuck = true
  await this.actor.update({"system.status.fortune.value" : runeFortune + currentFortune})
  this.script.message(`Fortune points increased from ${currentFortune} to ${runeFortune + currentFortune}.`)
}
else
{
  this.item.flags.runeOfLuck = true
  await this.actor.update({"system.status.fortune.value" : Math.max(0, currentFortune - runeFortune)})
  this.script.message(`Fortune points reduced to ${Math.max(0, currentFortune - runeFortune)}.`)
}