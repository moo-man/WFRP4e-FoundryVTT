let stunned = this.actor.hasCondition("stunned")
if (stunned)
{
   this.script.scriptNotification(`Cleared 1 Stunned Condition`)
   this.actor.removeCondition("stunned");
}
else 
{
	this.script.scriptNotification(`No Stunned Conditions`)
}