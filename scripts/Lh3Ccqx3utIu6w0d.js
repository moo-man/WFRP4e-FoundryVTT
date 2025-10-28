if (!args.ablazeApplied)
{
  args.ablazeApplied = true;
  await args.actor.addCondition("ablaze");
}