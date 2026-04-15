if (args.sourceItem?.system.properties?.qualities.hack && !args.hackReminder)
{
  args.hackReminder = true;
  if (args.opposedTest)
  {
    args.opposedTest.result.other.push(`<strong>${this.effect.name}</strong>: Hack causes ${this.item.Advances} extra damage`)
  }
}