let poisoned = args.actor.hasCondition("poisoned")
if (poisoned)
{
   this.script.scriptNotification(`Removed ${poisoned.conditionValue} Poisoned Conditions`)
   poisoned.delete();  
}
else
  this.script.scriptNotification(`No Poisoned Conditions`)