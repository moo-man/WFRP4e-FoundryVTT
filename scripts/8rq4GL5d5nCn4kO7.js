let caster = this.effect.sourceActor
if (caster)
{
    let healed= caster.characteristics.wp.bonus
    this.actor.modifyWounds(healed);
    this.script.message(`<strong>${this.actor.prototypeToken.name}</strong> regains ${healed} Wounds`)
}