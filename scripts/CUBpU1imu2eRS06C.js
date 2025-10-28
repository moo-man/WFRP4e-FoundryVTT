if (args.opposedTest.attackerTest.weapon?.system.properties?.qualities.hack && !args.hackReminder)
{
  args.hackReminder = true;
  args.opposedTest.result.other.push(`<strong>${this.effect.name}</strong>: Hack causes ${this.item.Advances} extra damage`)
}