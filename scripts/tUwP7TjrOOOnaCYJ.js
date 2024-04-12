let fatigued = this.actor.hasCondition("fatigued")
if (fatigued)
{
   this.script.scriptNotification(`Cleared ${fatigued.conditionValue} Fatigued Conditions`)
   fatigued.delete();  
}
else 
{
	this.script.scriptNotification(`No Fatigued Conditions`)
}