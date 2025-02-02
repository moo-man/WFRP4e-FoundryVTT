let effectsToEnable = this.actor.items.filter(i => i.type == "disease").reduce((effects, item) => effects.concat(item.effects.contents), []).concat(this.actor.effects.contents.filter(i => i.isCondition)).filter(i => i.disabled);

if (effectsToEnable.length)
{
    this.script.notification(`Re-enabling ${effectsToEnable.map(i => i.name).join(", ")}.`);
    effectsToEnable.forEach(i => i.update({disabled : false}))
}