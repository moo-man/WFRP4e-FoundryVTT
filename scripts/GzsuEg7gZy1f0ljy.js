let bleeding = this.actor.hasCondition("bleeding")
if (bleeding)
{
   this.script.notification(`Cleared ${bleeding.conditionValue} Bleeding Conditions`)
   bleeding.delete();  
}
else 
{
   this.script.notification(`No Bleeding Conditions`)
}