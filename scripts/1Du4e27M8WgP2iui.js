if (args.equipped === true && this.actor.name !== "Kurgorn Three-eyes") 
{
    this.actor.addCondition("blinded", 1, {"statuses" : ["blinded", "blind"]})
    this.script.notification(`Blinded while wearing the ${this.item.name}`);
} 

if (args.equipped === false && this.actor.name !== "Kurgorn Three-eyes") 
{
  this.actor.removeCondition("blinded")
}