if (
  this.item == args.defenderTest.item
  && args.defenderTest.succeeded 
  && args.defenderTest.item?.system?.attackType == 'melee'
  && (args.attackerTest.item.properties.qualities?.magical || args.attackerTest.item.properties.unusedQualities?.magical)
) 
{
  args.opposedTest.result.other.push(`<strong>${this.effect.name}:</strong> destroys magical ${args.attackerTest.item.name}.`)
}