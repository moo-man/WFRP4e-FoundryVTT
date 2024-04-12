if (this.actor.hasCondition("broken"))
{
    this.actor.removeCondition("broken")
    this.script.scriptNotification(`Cannot have Broken`);
}