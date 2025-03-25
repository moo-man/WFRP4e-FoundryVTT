let roll = await new Roll("1d100")
await roll.evaluate()
await roll.toMessage({"flavor": `Wyssan's Dice Reversal`})

if (roll.result % 11 === 0 || roll.result === 100) {
  await this.item.setFlag("world", "inert", true)
}