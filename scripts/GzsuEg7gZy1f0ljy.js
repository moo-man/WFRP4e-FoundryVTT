let bleeding = this.actor.hasCondition("bleeding")
if (bleeding)
{
   this.script.scriptNotification(`Cleared ${bleeding.conditionValue} Bleeding Conditions`)
   bleeding.delete();  
}
else 
{
   this.script.scriptNotification(`No Bleeding Conditions`)
}