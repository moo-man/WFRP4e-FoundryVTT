let stunned = this.actor.hasCondition("stunned")
if (stunned)
{
   this.script.notification(`Cleared 1 Stunned Condition`)
   this.actor.removeCondition("stunned");
}
else 
{
	this.script.notification(`No Stunned Conditions`)
}