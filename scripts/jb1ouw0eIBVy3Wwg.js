if (
  this.item == args.attackerTest.item
  && args.attackerTest.succeeded 
  && args.defenderTest.item?.system?.attackType == 'melee'
  && (args.defenderTest.item.properties.qualities?.magical || args.defenderTest.item.properties.unusedQualities?.magical)
) 
{
  args.opposedTest.result.other.push(`<strong>${this.effect.name}:</strong> destroys magical ${args.defenderTest.item.name}.`)
}