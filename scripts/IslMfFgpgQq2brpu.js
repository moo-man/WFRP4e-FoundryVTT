if (this.actor.hasCondition("broken"))
{
    this.actor.removeCondition("broken")
    this.script.notification(`Cannot have Broken`);
}