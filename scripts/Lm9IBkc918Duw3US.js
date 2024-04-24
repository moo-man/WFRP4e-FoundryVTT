let career = this.actor.itemTypes.career.find(c => c.getFlag("wfrp4e", "doubleLife"))

if(career)
{
    career.system.current.value = true;
}