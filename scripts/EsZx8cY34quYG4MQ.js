let runes = this.actor.itemTypes["wfrp4e-dwarfs.rune"]
if (runes.length === 0) return ui.notifications.error("This Actor does not know any runes.")

let rune = await ItemDialog.create(this.actor.itemTypes["wfrp4e-dwarfs.rune"], 1, {text: "Select Rune", title: this.effect.name})
rune[0].system.use({initialTooltip: "Anvil of Doom Bonus", fields: {modifier: 20}})