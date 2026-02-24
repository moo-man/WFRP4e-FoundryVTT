if (args.test.result.castOutcome == "success" && args.test.spell.system.lore.value.includes("high"))
{
  this.effect.update({name: this.effect.setSpecifier(parseInt(this.effect.specifier - 1))})

  this.script.message("Ward value is now " + (this.effect.specifier - 1), {flavor: this.effect.sourceItem.name})
}