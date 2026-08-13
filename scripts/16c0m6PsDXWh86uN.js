let property = this.effect.getFlag("wfrp4e", "property");
if (property && !this.item.system.flaws.value.find(i => i.name == property));
{
    this.item.system.flaws.value.push({name : property});
}