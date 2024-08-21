let poisoned = args.actor.hasCondition("poisoned")
if (poisoned)
{
   this.script.notification(`Removed ${poisoned.conditionValue} Poisoned Conditions`)
   poisoned.delete();  
}
else
  this.script.notification(`No Poisoned Conditions`)