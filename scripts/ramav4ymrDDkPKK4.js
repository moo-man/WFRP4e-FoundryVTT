if (this.actor.hasCondition("bleeding"))
{
    this.actor.removeCondition("bleeding");
    this.script.scriptNotification("Removed 1 Bleeding Condition")
}
else 
{
    this.script.scriptNotification("No Bleeding Conditions");
}