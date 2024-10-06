if (this.actor.hasCondition("bleeding"))
{
    this.actor.removeCondition("bleeding");
    this.script.notification("Removed 1 Bleeding Condition")
}
else 
{
    this.script.notification("No Bleeding Conditions");
}