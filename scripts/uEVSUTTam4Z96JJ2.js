if (this.item.equipped.value
  && args.opposedTest.attackerTest.item 
  && (args.opposedTest.attackerTest.item.isRanged || args.opposedTest.attackerTest?.spell)
  ) 
{
  args.modifiers.other.push({label : this.effect.name, details : "Damage Reduction", value : -2})
}