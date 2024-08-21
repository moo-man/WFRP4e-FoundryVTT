let fatigued = this.actor.hasCondition("fatigued")
if (fatigued)
{
   this.script.notification(`Cleared ${fatigued.conditionValue} Fatigued Conditions`)
   fatigued.delete();  
}
else 
{
	this.script.notification(`No Fatigued Conditions`)
}