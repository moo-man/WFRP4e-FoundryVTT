let extra = this.effect.getFlag("wfrp4e", "extra")
if (!this.item.system.properties.qualities[extra]) 
{ 
    this.item.system.qualities.value.push({name : extra});
}