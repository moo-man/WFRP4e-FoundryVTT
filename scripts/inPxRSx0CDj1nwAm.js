if (args.test.result.fumble && !this.actor.itemTypes.talent.find(i => i.name == "Arcane Magic (Fire)"))
{
    this.actor.addCondition("ablaze");
}