let property = this.effect.getFlag("wfrp4e", "property");
if (property && !this.item.system.qualities.value.find(i => i.name == property));
{
    this.item.system.qualities.value.push({name : property});
}