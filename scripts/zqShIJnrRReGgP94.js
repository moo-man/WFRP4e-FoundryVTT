let {added, removed} = this.effect.getFlag("wfrp4e", "propertiesChanged");

for(let property of (added || []))
{
    let hasValue = game.wfrp4e.config.propertyHasValue[property];
    if (!args.item.system.qualities.value.find(i => i.name == property))
    {
        args.item.system.qualities.value.push({name : property, value : (hasValue ? 2 : null)})
    }
}

for(let property of (removed || []))
{
    args.item.system.flaws.value = args.item.system.flaws.value.filter(i => i.name != property)
}