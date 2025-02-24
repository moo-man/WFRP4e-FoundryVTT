let effectsToDisable = this.actor.items.filter(i => i.type == "disease").reduce((effects, item) => effects.concat(item.effects.contents), []).concat(this.actor.effects.contents.filter(i => i.isCondition)).filter(i => i.active);

if (effectsToDisable.length)
{
    this.script.notification(`Disabling ${effectsToDisable.map(i => i.name).join(", ")}.`);
    effectsToDisable.forEach(i => i.update({disabled : true}))
}